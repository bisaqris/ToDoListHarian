import { pool } from "../config/database.js";

const toCategoryResponse = (row) => ({
  id: String(row.id),
  code: row.code,
  name: row.name,
  color: row.color,
  isPublic: row.is_public,
  createdBy: row.created_by ? String(row.created_by) : null,
  createdAt: row.created_at,
});

export const getCategories = async () => {
  const result = await pool.query("SELECT * FROM categories ORDER BY name ASC");
  return result.rows.map(toCategoryResponse);
};

export const createCategory = async (data, user) => {
  const code = data.code || data.name?.toLowerCase().trim().replace(/\s+/g, "-");
  if (!code || !data.name) {
    throw new Error("Category code and name are required");
  }

  const result = await pool.query(
    `INSERT INTO categories (code, name, color, is_public, created_by)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [code, data.name, data.color || "blue", data.isPublic ?? true, user.id],
  );

  return toCategoryResponse(result.rows[0]);
};
