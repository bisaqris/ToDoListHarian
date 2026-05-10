import { pool } from "../config/database.js";
import { TodoModel } from "../models/todo.model.js";
import { isAdmin } from "../utils/rbac.js";

const formatDate = (date) => {
  if (!date) return null;
  if (typeof date === "string") return date.split("T")[0];

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const toTodoResponse = (row) => ({
  id: String(row.id),
  userId: row.user_id ? String(row.user_id) : null,
  ownerName: row.owner_name || null,
  title: row.title,
  description: row.description,
  completed: row.completed,
  priority: row.priority,
  category: row.category_code || row.category,
  categoryName: row.category_name || row.category,
  dueDate: formatDate(row.due_date),
  dueTime: row.due_time ? row.due_time.slice(0, 5) : "",
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const todoSelect = `
  SELECT
    t.*,
    u.name AS owner_name,
    c.code AS category_code,
    c.name AS category_name
  FROM todos t
  LEFT JOIN users u ON u.id = t.user_id
  LEFT JOIN categories c ON c.id = t.category_id
`;

const logActivity = async (client, { todoId, userId, action, details = {} }) => {
  await client.query(
    `INSERT INTO todo_activity_logs (todo_id, user_id, action, details)
     VALUES ($1, $2, $3, $4::jsonb)`,
    [todoId, userId, action, JSON.stringify(details)],
  );
};

export const createTodo = async (data, user) => {
  const todo = TodoModel(data);
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const categoryResult = await client.query(
      "SELECT id, code FROM categories WHERE code = $1",
      [todo.category],
    );
    const category = categoryResult.rows[0];

    const result = await client.query(
      `INSERT INTO todos
        (user_id, category_id, title, description, completed, priority, category, due_date, due_time, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        user.id,
        category?.id || null,
        todo.title,
        todo.description,
        todo.completed,
        todo.priority,
        category?.code || todo.category,
        todo.dueDate,
        todo.dueTime || null,
        todo.createdAt,
      ],
    );

    await logActivity(client, {
      todoId: result.rows[0].id,
      userId: user.id,
      action: "created",
      details: { title: todo.title },
    });

    await client.query("COMMIT");
    return getTodoById(result.rows[0].id, user);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const getTodos = async (user) => {
  const params = [];
  let whereClause = "";

  if (!isAdmin(user)) {
    params.push(user.id);
    whereClause = "WHERE t.user_id = $1";
  }

  const result = await pool.query(
    `${todoSelect}
     ${whereClause}
     ORDER BY t.created_at DESC`,
    params,
  );
  return result.rows.map(toTodoResponse);
};

export const getTodoById = async (id, user) => {
  const params = [id];
  let ownerClause = "";

  if (!isAdmin(user)) {
    params.push(user.id);
    ownerClause = "AND t.user_id = $2";
  }

  const result = await pool.query(
    `${todoSelect}
     WHERE t.id = $1 ${ownerClause}`,
    params,
  );

  return result.rows[0] ? toTodoResponse(result.rows[0]) : null;
};

export const updateTodo = async (id, data, user) => {
  const allowedFields = {
    title: "title",
    description: "description",
    completed: "completed",
    priority: "priority",
    category: "category",
    dueDate: "due_date",
    dueTime: "due_time",
  };

  const fields = Object.entries(data).filter(([key]) => allowedFields[key]);

  if (fields.length === 0) {
    return null;
  }

  if (data.category) {
    const categoryResult = await pool.query("SELECT id FROM categories WHERE code = $1", [
      data.category,
    ]);
    data.categoryId = categoryResult.rows[0]?.id || null;
    fields.push(["categoryId", data.categoryId]);
    allowedFields.categoryId = "category_id";
  }

  const setClauses = fields.map(
    ([key], index) => `${allowedFields[key]} = $${index + 1}`,
  );
  const values = fields.map(([key, value]) => {
    if (key === "dueTime" && value === "") return null;
    if (key === "dueDate" && value === "") return null;
    return value;
  });

  const params = [...values, id];
  let ownerClause = "";

  if (!isAdmin(user)) {
    params.push(user.id);
    ownerClause = `AND user_id = $${params.length}`;
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const result = await client.query(
    `UPDATE todos
     SET ${setClauses.join(", ")}, updated_at = NOW()
     WHERE id = $${values.length + 1} ${ownerClause}
     RETURNING *`,
      params,
    );

    if (!result.rows[0]) {
      await client.query("ROLLBACK");
      return null;
    }

    await logActivity(client, {
      todoId: id,
      userId: user.id,
      action: "updated",
      details: data,
    });

    await client.query("COMMIT");
    return getTodoById(id, user);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const deleteTodo = async (id, user) => {
  const params = [id];
  let ownerClause = "";

  if (!isAdmin(user)) {
    params.push(user.id);
    ownerClause = "AND user_id = $2";
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const result = await client.query(
      `DELETE FROM todos WHERE id = $1 ${ownerClause}`,
      params,
    );

    if (result.rowCount > 0) {
      await logActivity(client, {
        todoId: null,
        userId: user.id,
        action: "deleted",
        details: { todoId: id },
      });
    }

    await client.query("COMMIT");
    return result.rowCount > 0;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
