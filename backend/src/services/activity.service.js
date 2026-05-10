import { pool } from "../config/database.js";
import { isAdmin } from "../utils/rbac.js";

const toActivityResponse = (row) => ({
  id: String(row.id),
  todoId: row.todo_id ? String(row.todo_id) : null,
  userId: row.user_id ? String(row.user_id) : null,
  userName: row.user_name,
  action: row.action,
  details: row.details,
  createdAt: row.created_at,
});

export const getActivities = async (user) => {
  const params = [];
  let whereClause = "";

  if (!isAdmin(user)) {
    params.push(user.id);
    whereClause = "WHERE a.user_id = $1";
  }

  const result = await pool.query(
    `SELECT a.*, u.name AS user_name
     FROM todo_activity_logs a
     LEFT JOIN users u ON u.id = a.user_id
     ${whereClause}
     ORDER BY a.created_at DESC
     LIMIT 50`,
    params,
  );

  return result.rows.map(toActivityResponse);
};
