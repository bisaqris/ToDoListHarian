import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { isAdmin } from "../utils/rbac.js";

describe("isAdmin", () => {
  test("✅ user dengan role admin → true", () => {
    assert.equal(isAdmin({ roles: ["admin"] }), true);
  });

  test("✅ user dengan beberapa role termasuk admin → true", () => {
    assert.equal(isAdmin({ roles: ["user", "admin", "moderator"] }), true);
  });

  test("❌ user tanpa role admin → false", () => {
    assert.equal(isAdmin({ roles: ["user"] }), false);
  });

  test("❌ user tanpa properti roles → falsy (undefined)", () => {
    // isAdmin menggunakan optional chaining (?.) → hasilnya undefined (falsy), bukan false
    // Catatan: jika ingin strict boolean, ubah implementasi menjadi: !!user?.roles?.includes("admin")
    assert.ok(!isAdmin({ id: "1" }));
  });

  test("❌ user null → falsy (undefined)", () => {
    // Optional chaining pada null/undefined mengembalikan undefined
    assert.ok(!isAdmin(null));
  });

  test("❌ user undefined → falsy (undefined)", () => {
    assert.ok(!isAdmin(undefined));
  });

  test("❌ roles array kosong → false", () => {
    assert.equal(isAdmin({ roles: [] }), false);
  });
});
