import { pool } from "../config/database.js";
import { TodoModel } from "../models/todo.model.js";
import { isAdmin } from "../utils/rbac.js";
import { buildParameterizedUpdate, createRowMapper } from "../utils/parameterized.js";

const formatDate = (date) => {
  if (!date) return null;
  if (typeof date === "string") return date.split("T")[0];

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const toTodoResponse = createRowMapper({
  id: (row) => String(row.id),
  userId: (row) => (row.user_id ? String(row.user_id) : null),
  ownerName: (row) => row.owner_name || null,
  title: "title",
  description: "description",
  completed: "completed",
  status: "status",
  statusName: (row) => row.status_name || row.status,
  priority: "priority",
  category: (row) => row.category_code || row.category,
  categoryName: (row) => row.category_name || row.category,
  dueDate: (row) => formatDate(row.due_date),
  dueTime: (row) => (row.due_time ? row.due_time.slice(0, 5) : ""),
  createdAt: "created_at",
  updatedAt: "updated_at",
});

const todoUpdateFields = {
  title: "title",
  description: "description",
  priority: "priority",
  category: "category",
  dueDate: "due_date",
  dueTime: "due_time",
};

const todoSelect = `
  SELECT
    t.*,
    u.name AS owner_name,
    c.code AS category_code,
    c.name AS category_name,
    s.name AS status_name
  FROM todos t
  LEFT JOIN users u ON u.id = t.user_id
  LEFT JOIN categories c ON c.id = t.category_id
  LEFT JOIN todo_statuses s ON s.code = t.status
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
        (user_id, category_id, title, description, completed, status, priority, category, due_date, due_time, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        user.id,
        category?.id || null,
        todo.title,
        todo.description,
        todo.completed,
        todo.completed ? "completed" : "pending",
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
  const normalizedData = { ...data };
  const updateFields = { ...todoUpdateFields };

  delete normalizedData.completed;
  delete normalizedData.status;

  if (normalizedData.category) {
    const categoryResult = await pool.query("SELECT id FROM categories WHERE code = $1", [
      normalizedData.category,
    ]);
    normalizedData.categoryId = categoryResult.rows[0]?.id || null;
    updateFields.categoryId = "category_id";
  }

  const preparedData = Object.fromEntries(
    Object.entries(normalizedData).map(([key, value]) => {
      if (key === "dueTime" && value === "") return [key, null];
      if (key === "dueDate" && value === "") return [key, null];
      return [key, value];
    }),
  );

  const { setClauses, values, entries } = buildParameterizedUpdate(
    preparedData,
    updateFields,
  );

  if (entries.length === 0) {
    return null;
  }

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
      details: normalizedData,
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

export const transitionTodoStatus = async (id, event, user) => {
  const params = [id];
  let ownerClause = "";

  if (!isAdmin(user)) {
    params.push(user.id);
    ownerClause = `AND t.user_id = $${params.length}`;
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const todoResult = await client.query(
      `SELECT t.id, t.status
       FROM todos t
       WHERE t.id = $1 ${ownerClause}
       FOR UPDATE`,
      params,
    );

    const todo = todoResult.rows[0];
    if (!todo) {
      await client.query("ROLLBACK");
      return null;
    }

    const transitionResult = await client.query(
      `SELECT from_status, to_status, event, label
       FROM todo_status_transitions
       WHERE from_status = $1 AND event = $2`,
      [todo.status, event],
    );
    const transition = transitionResult.rows[0];

    if (!transition) {
      throw new Error(`Invalid transition '${event}' from status '${todo.status}'`);
    }

    await client.query(
      `UPDATE todos
       SET status = $1,
           completed = $2,
           updated_at = NOW()
       WHERE id = $3`,
      [transition.to_status, transition.to_status === "completed", id],
    );

    await logActivity(client, {
      todoId: id,
      userId: user.id,
      action: "status_transition",
      details: transition,
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

export const getTodoStatusTransitions = async (id, user) => {
  const todo = await getTodoById(id, user);
  if (!todo) return null;

  const result = await pool.query(
    `SELECT from_status, to_status, event, label
     FROM todo_status_transitions
     WHERE from_status = $1
     ORDER BY id ASC`,
    [todo.status],
  );

  return result.rows.map(createRowMapper({
    fromStatus: "from_status",
    toStatus: "to_status",
    event: "event",
    label: "label",
  }));
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

export const getMonthlyStats = async (user) => {
  const params = [];
  // Mengambil data 30 hari terakhir berdasarkan created_at
  let whereClause = "WHERE t.created_at >= NOW() - INTERVAL '30 days'";

  // Proteksi Role: User biasa hanya melihat miliknya, Admin melihat semua
  if (!isAdmin(user)) {
    params.push(user.id);
    whereClause += " AND t.user_id = $1";
  }

  const query = `
    SELECT 
      COUNT(*) AS total,
      SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) AS completed
    FROM todos t
    ${whereClause}
  `;

  try {
    const result = await pool.query(query, params);
    const data = result.rows[0];

    const total = parseInt(data.total) || 0;
    const completed = parseInt(data.completed) || 0;

    // Perhitungan persentase yang benar
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      completed,
      percentage,
      period: "Last 30 Days"
    };
  } catch (error) {
    console.error("Error fetching monthly stats:", error);
    throw error;
  }
};