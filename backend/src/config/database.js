import "dotenv/config";
import pg from "pg";
import { hashPassword } from "../utils/password.js";

const { Pool } = pg;

export const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || "todokpl_db",
  user: process.env.DB_USER || "postgres",
  password: String(process.env.DB_PASSWORD || ""),
});

export const initDatabase = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS roles (
      id SERIAL PRIMARY KEY,
      name VARCHAR(50) NOT NULL UNIQUE,
      description TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS permissions (
      id SERIAL PRIMARY KEY,
      name VARCHAR(80) NOT NULL UNIQUE,
      description TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS role_permissions (
      role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
      permission_id INTEGER NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
      PRIMARY KEY (role_id, permission_id)
    );

    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(160) NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS user_roles (
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
      PRIMARY KEY (user_id, role_id)
    );

    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      code VARCHAR(50) NOT NULL UNIQUE,
      name VARCHAR(100) NOT NULL,
      color VARCHAR(30) NOT NULL DEFAULT 'blue',
      is_public BOOLEAN NOT NULL DEFAULT TRUE,
      created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS todo_statuses (
      code VARCHAR(30) PRIMARY KEY,
      name VARCHAR(80) NOT NULL,
      description TEXT DEFAULT '',
      is_terminal BOOLEAN NOT NULL DEFAULT FALSE
    );

    CREATE TABLE IF NOT EXISTS todo_status_transitions (
      id SERIAL PRIMARY KEY,
      from_status VARCHAR(30) NOT NULL REFERENCES todo_statuses(code) ON DELETE CASCADE,
      to_status VARCHAR(30) NOT NULL REFERENCES todo_statuses(code) ON DELETE CASCADE,
      event VARCHAR(40) NOT NULL,
      label VARCHAR(80) NOT NULL,
      UNIQUE (from_status, event)
    );

    CREATE TABLE IF NOT EXISTS todos (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT DEFAULT '',
      completed BOOLEAN NOT NULL DEFAULT FALSE,
      status VARCHAR(30) NOT NULL DEFAULT 'pending' REFERENCES todo_statuses(code),
      priority VARCHAR(20) NOT NULL DEFAULT 'medium',
      category VARCHAR(50) NOT NULL DEFAULT 'general',
      due_date DATE,
      due_time TIME,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS todo_activity_logs (
      id SERIAL PRIMARY KEY,
      todo_id INTEGER REFERENCES todos(id) ON DELETE SET NULL,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      action VARCHAR(50) NOT NULL,
      details JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await seedStatusAutomata();

  await pool.query(`
    ALTER TABLE todos ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
    ALTER TABLE todos ADD COLUMN IF NOT EXISTS category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL;
    ALTER TABLE todos ADD COLUMN IF NOT EXISTS due_time TIME;
    ALTER TABLE todos ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
    ALTER TABLE todos ADD COLUMN IF NOT EXISTS status VARCHAR(30) NOT NULL DEFAULT 'pending' REFERENCES todo_statuses(code);
  `);

  await seedDatabase();
};

const seedStatusAutomata = async () => {
  await pool.query(`
    INSERT INTO todo_statuses (code, name, description, is_terminal)
    VALUES
      ('pending', 'Menunggu', 'Tugas sudah dibuat tetapi belum dikerjakan', FALSE),
      ('in_progress', 'Dikerjakan', 'Tugas sedang diproses', FALSE),
      ('completed', 'Selesai', 'Tugas sudah selesai', TRUE),
      ('cancelled', 'Dibatalkan', 'Tugas dibatalkan', TRUE)
    ON CONFLICT (code) DO UPDATE SET
      name = EXCLUDED.name,
      description = EXCLUDED.description,
      is_terminal = EXCLUDED.is_terminal;

    INSERT INTO todo_status_transitions (from_status, to_status, event, label)
    VALUES
      ('pending', 'in_progress', 'start', 'Mulai'),
      ('pending', 'completed', 'complete', 'Selesaikan'),
      ('pending', 'cancelled', 'cancel', 'Batalkan'),
      ('in_progress', 'pending', 'pause', 'Tunda'),
      ('in_progress', 'completed', 'complete', 'Selesaikan'),
      ('in_progress', 'cancelled', 'cancel', 'Batalkan'),
      ('completed', 'in_progress', 'reopen', 'Buka Lagi'),
      ('cancelled', 'pending', 'reopen', 'Buka Lagi')
    ON CONFLICT (from_status, event) DO UPDATE SET
      to_status = EXCLUDED.to_status,
      label = EXCLUDED.label;
  `);
};

const seedDatabase = async () => {
  await pool.query(`
    INSERT INTO roles (name, description)
    VALUES
      ('admin', 'Mengelola seluruh pengguna, kategori, dan todo'),
      ('user', 'Mengelola todo pribadi')
    ON CONFLICT (name) DO NOTHING;

    INSERT INTO permissions (name, description)
    VALUES
      ('todos:read:own', 'Melihat todo milik sendiri'),
      ('todos:write:own', 'Membuat dan mengubah todo milik sendiri'),
      ('todos:read:all', 'Melihat semua todo'),
      ('todos:write:all', 'Mengubah semua todo'),
      ('users:read', 'Melihat daftar pengguna'),
      ('categories:manage', 'Mengelola kategori publik'),
      ('activity:read', 'Melihat log aktivitas')
    ON CONFLICT (name) DO NOTHING;

    INSERT INTO role_permissions (role_id, permission_id)
    SELECT r.id, p.id
    FROM roles r
    CROSS JOIN permissions p
    WHERE r.name = 'admin'
    ON CONFLICT DO NOTHING;

    INSERT INTO role_permissions (role_id, permission_id)
    SELECT r.id, p.id
    FROM roles r
    JOIN permissions p ON p.name IN ('todos:read:own', 'todos:write:own')
    WHERE r.name = 'user'
    ON CONFLICT DO NOTHING;
  `);

  const adminEmail = process.env.ADMIN_EMAIL || "admin@todokpl.local";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin12345";
  const adminHash = await hashPassword(adminPassword);

  await pool.query(
    `INSERT INTO users (name, email, password_hash)
     VALUES ($1, $2, $3)
     ON CONFLICT (email) DO NOTHING`,
    ["Administrator", adminEmail, adminHash],
  );

  await pool.query(
    `INSERT INTO user_roles (user_id, role_id)
     SELECT u.id, r.id
     FROM users u, roles r
     WHERE u.email = $1 AND r.name = 'admin'
     ON CONFLICT DO NOTHING`,
    [adminEmail],
  );

  await pool.query(`
    INSERT INTO categories (code, name, color, is_public)
    VALUES
      ('work', 'Pekerjaan', 'blue', TRUE),
      ('personal', 'Pribadi', 'purple', TRUE),
      ('shopping', 'Belanja', 'green', TRUE),
      ('health', 'Kesehatan', 'red', TRUE),
      ('education', 'Pendidikan', 'yellow', TRUE),
      ('community', 'Kegiatan Warga', 'teal', TRUE),
      ('public-service', 'Layanan Publik', 'indigo', TRUE)
    ON CONFLICT (code) DO NOTHING;
  `);

  await pool.query(
    `UPDATE todos
     SET user_id = (SELECT id FROM users WHERE email = $1),
         category_id = COALESCE(
           (SELECT id FROM categories WHERE code = todos.category),
           (SELECT id FROM categories WHERE code = 'personal')
         )
     WHERE user_id IS NULL`,
    [adminEmail],
  );

  await pool.query(`
    UPDATE todos
    SET status = CASE
      WHEN completed = TRUE THEN 'completed'
      ELSE 'pending'
    END
    WHERE status IS NULL OR status = '';
  `);
};
