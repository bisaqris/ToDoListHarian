import test from "node:test";
import assert from "node:assert/strict";

import { TodoModel } from "../src/models/todo.model.js";
import { createRowMapper, buildParameterizedUpdate } from "../src/utils/parameterized.js";
import { isAdmin } from "../src/utils/rbac.js";
import { signToken, verifyToken } from "../src/utils/jwt.js";
import { hashPassword, verifyPassword } from "../src/utils/password.js";

process.env.JWT_SECRET = "unit-test-secret";

test("isAdmin returns true only for users with admin role", () => {
  assert.equal(isAdmin({ roles: ["user", "admin"] }), true);
  assert.equal(isAdmin({ roles: ["user"] }), false);
  assert.equal(isAdmin(null), false);
});

test("createRowMapper maps database rows into API response shape", () => {
  const mapTodo = createRowMapper({
    id: (row) => String(row.id),
    title: "title",
    statusName: (row) => row.status_name || row.status,
  });

  assert.deepEqual(
    mapTodo({ id: 7, title: "Belajar", status_name: "Menunggu", status: "pending" }),
    {
      id: "7",
      title: "Belajar",
      statusName: "Menunggu",
    },
  );
});

test("buildParameterizedUpdate keeps only allowed fields and builds placeholders", () => {
  const result = buildParameterizedUpdate(
    {
      title: "Revisi laporan",
      description: "Tambah detail laporan",
      ignored: "tidak dipakai",
    },
    {
      title: "title",
      description: "description",
    },
  );

  assert.deepEqual(result.entries, [
    ["title", "Revisi laporan"],
    ["description", "Tambah detail laporan"],
  ]);
  assert.deepEqual(result.setClauses, ["title = $1", "description = $2"]);
  assert.deepEqual(result.values, ["Revisi laporan", "Tambah detail laporan"]);
  assert.equal(result.nextIndex, 3);
});

test("TodoModel applies default values for optional fields", () => {
  const todo = TodoModel({ title: "Siapkan presentasi", category: "work" });

  assert.equal(todo.title, "Siapkan presentasi");
  assert.equal(todo.description, "");
  assert.equal(todo.completed, false);
  assert.equal(todo.priority, "medium");
  assert.equal(todo.category, "work");
  assert.equal(todo.dueDate, null);
  assert.equal(todo.dueTime, null);
  assert.ok(todo.createdAt instanceof Date);
});

test("signToken and verifyToken round-trip the payload", () => {
  const token = signToken({ sub: "42", roles: ["admin"] }, "1h");
  const payload = verifyToken(token);

  assert.equal(payload.sub, "42");
  assert.deepEqual(payload.roles, ["admin"]);
  assert.ok(payload.iat <= payload.exp);
});

test("hashPassword and verifyPassword validate the password pair", async () => {
  const hash = await hashPassword("Rahasia123");

  assert.equal(await verifyPassword("Rahasia123", hash), true);
  assert.equal(await verifyPassword("Salah123", hash), false);
});