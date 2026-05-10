import { pool } from "../config/database.js";
import { TodoModel } from "../models/todo.model.js";

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
  title: row.title,
  description: row.description,
  completed: row.completed,
  priority: row.priority,
  category: row.category,
  dueDate: formatDate(row.due_date),
  dueTime: row.due_time ? row.due_time.slice(0, 5) : "",
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const createTodo = async (data) => {
  const todo = TodoModel(data);
  const result = await pool.query(
    `INSERT INTO todos
      (title, description, completed, priority, category, due_date, due_time, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      todo.title,
      todo.description,
      todo.completed,
      todo.priority,
      todo.category,
      todo.dueDate,
      todo.dueTime || null,
      todo.createdAt,
    ],
  );

  return toTodoResponse(result.rows[0]);
};

export const getTodos = async () => {
  const result = await pool.query("SELECT * FROM todos ORDER BY created_at DESC");
  return result.rows.map(toTodoResponse);
};

export const updateTodo = async (id, data) => {
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

  const setClauses = fields.map(
    ([key], index) => `${allowedFields[key]} = $${index + 1}`,
  );
  const values = fields.map(([key, value]) => {
    if (key === "dueTime" && value === "") return null;
    if (key === "dueDate" && value === "") return null;
    return value;
  });

  const result = await pool.query(
    `UPDATE todos
     SET ${setClauses.join(", ")}, updated_at = NOW()
     WHERE id = $${values.length + 1}
     RETURNING *`,
    [...values, id],
  );

  return result.rows[0] ? toTodoResponse(result.rows[0]) : null;
};

export const deleteTodo = async (id) => {
  const result = await pool.query("DELETE FROM todos WHERE id = $1", [id]);
  return result.rowCount > 0;
};
