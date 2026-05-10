import { pool } from "../config/database.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { signToken } from "../utils/jwt.js";

const toUserResponse = (row) => ({
  id: String(row.id),
  name: row.name,
  email: row.email,
  isActive: row.is_active,
  roles: row.roles || [],
  permissions: row.permissions || [],
  createdAt: row.created_at,
});

const userSelect = `
  SELECT
    u.id,
    u.name,
    u.email,
    u.is_active,
    u.created_at,
    COALESCE(array_agg(DISTINCT r.name) FILTER (WHERE r.name IS NOT NULL), '{}') AS roles,
    COALESCE(array_agg(DISTINCT p.name) FILTER (WHERE p.name IS NOT NULL), '{}') AS permissions
  FROM users u
  LEFT JOIN user_roles ur ON ur.user_id = u.id
  LEFT JOIN roles r ON r.id = ur.role_id
  LEFT JOIN role_permissions rp ON rp.role_id = r.id
  LEFT JOIN permissions p ON p.id = rp.permission_id
`;

export const getUserById = async (id) => {
  const result = await pool.query(
    `${userSelect}
     WHERE u.id = $1
     GROUP BY u.id`,
    [id],
  );

  return result.rows[0] ? toUserResponse(result.rows[0]) : null;
};

export const registerUser = async ({ name, email, password }) => {
  if (!name || !email || !password) {
    throw new Error("Name, email, and password are required");
  }

  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }

  const passwordHash = await hashPassword(password);
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const userResult = await client.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, LOWER($2), $3)
       RETURNING id`,
      [name, email, passwordHash],
    );

    await client.query(
      `INSERT INTO user_roles (user_id, role_id)
       SELECT $1, id FROM roles WHERE name = 'user'`,
      [userResult.rows[0].id],
    );

    await client.query("COMMIT");
    return getUserById(userResult.rows[0].id);
  } catch (error) {
    await client.query("ROLLBACK");
    if (error.code === "23505") {
      throw new Error("Email already registered");
    }
    throw error;
  } finally {
    client.release();
  }
};

export const loginUser = async ({ email, password }) => {
  const result = await pool.query(
    "SELECT id, password_hash, is_active FROM users WHERE email = LOWER($1)",
    [email],
  );

  const userRecord = result.rows[0];
  if (!userRecord || !(await verifyPassword(password, userRecord.password_hash))) {
    throw new Error("Invalid email or password");
  }

  if (!userRecord.is_active) {
    throw new Error("Account is inactive");
  }

  const user = await getUserById(userRecord.id);
  const token = signToken({
    sub: user.id,
    email: user.email,
    roles: user.roles,
  });

  return { user, token };
};

export const listUsers = async () => {
  const result = await pool.query(
    `${userSelect}
     GROUP BY u.id
     ORDER BY u.created_at DESC`,
  );

  return result.rows.map(toUserResponse);
};
