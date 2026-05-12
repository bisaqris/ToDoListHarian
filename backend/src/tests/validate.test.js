import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { validateId, validateTodoData } from "../utils/validate.js";

describe("validateTodoData — CREATE mode (isUpdate = false)", () => {
  test("✅ data valid lolos validasi", () => {
    const result = validateTodoData({
      title: "Beli susu",
      description: "Di Alfamart",
      completed: false,
      priority: "high",
      category: "shopping",
      dueDate: "2025-12-31",
    });
    assert.equal(result, true);
  });

  test("✅ hanya title yang diisi — field opsional tidak wajib", () => {
    assert.equal(validateTodoData({ title: "Minimal" }), true);
  });

  test("❌ title tidak ada → error required", () => {
    assert.throws(
      () => validateTodoData({ description: "tanpa title" }),
      (err) => {
        assert.ok(err.validationErrors.some((e) => e.includes("title")));
        assert.equal(err.statusCode, 400);
        return true;
      },
    );
  });

  test("❌ title bukan string → error type", () => {
    assert.throws(
      () => validateTodoData({ title: 123 }),
      (err) => {
        assert.ok(
          err.validationErrors.some((e) => e.includes("must be a string")),
        );
        return true;
      },
    );
  });

  test("❌ title melebihi 200 karakter → error maxLength", () => {
    assert.throws(
      () => validateTodoData({ title: "a".repeat(201) }),
      (err) => {
        assert.ok(err.validationErrors.some((e) => e.includes("200")));
        return true;
      },
    );
  });

  test("❌ priority tidak valid → error allowedValues", () => {
    assert.throws(
      () => validateTodoData({ title: "Test", priority: "urgent" }),
      (err) => {
        assert.ok(err.validationErrors.some((e) => e.includes("priority")));
        return true;
      },
    );
  });

  test("❌ category tidak valid → error allowedValues", () => {
    assert.throws(
      () => validateTodoData({ title: "Test", category: "food" }),
      (err) => {
        assert.ok(err.validationErrors.some((e) => e.includes("category")));
        return true;
      },
    );
  });

  test("❌ completed bukan boolean → error type", () => {
    assert.throws(
      () => validateTodoData({ title: "Test", completed: "yes" }),
      (err) => {
        assert.ok(err.validationErrors.some((e) => e.includes("boolean")));
        return true;
      },
    );
  });

  test("❌ dueDate format salah → error isDate", () => {
    assert.throws(
      () => validateTodoData({ title: "Test", dueDate: "bukan-tanggal" }),
      (err) => {
        assert.ok(err.validationErrors.some((e) => e.includes("ISO date")));
        return true;
      },
    );
  });

  test("❌ input null → error precondition", () => {
    assert.throws(() => validateTodoData(null), /Precondition violated/);
  });

  test("❌ input array → error precondition", () => {
    assert.throws(
      () => validateTodoData([{ title: "test" }]),
      /Precondition violated/,
    );
  });

  test("❌ beberapa field salah sekaligus → semua error terkumpul", () => {
    assert.throws(
      () =>
        validateTodoData({
          title: 999,
          priority: "darurat",
          completed: "true",
        }),
      (err) => {
        assert.ok(err.validationErrors.length >= 3);
        return true;
      },
    );
  });
});

describe("validateTodoData — UPDATE mode (isUpdate = true)", () => {
  test("✅ update tanpa title tetap lolos (title opsional saat update)", () => {
    assert.equal(validateTodoData({ priority: "low" }, true), true);
  });

  test("✅ update hanya description — lolos", () => {
    assert.equal(
      validateTodoData({ description: "Deskripsi baru" }, true),
      true,
    );
  });

  test("❌ update priority tidak valid → error", () => {
    assert.throws(
      () => validateTodoData({ priority: "critical" }, true),
      (err) => {
        assert.ok(err.validationErrors.some((e) => e.includes("priority")));
        return true;
      },
    );
  });
});

describe("validateId", () => {
  test("✅ ID valid berupa string biasa", () => {
    assert.equal(validateId("abc123"), true);
  });

  test("✅ ID berupa UUID panjang tetap valid", () => {
    assert.equal(validateId("550e8400-e29b-41d4-a716-446655440000"), true);
  });

  test("❌ ID string kosong → error", () => {
    assert.throws(() => validateId(""), /Precondition violated/);
  });

  test("❌ ID hanya spasi → error", () => {
    assert.throws(() => validateId("   "), /Precondition violated/);
  });

  test("❌ ID null → error", () => {
    assert.throws(() => validateId(null), /Precondition violated/);
  });

  test("❌ ID undefined → error", () => {
    assert.throws(() => validateId(undefined), /Precondition violated/);
  });

  test("❌ ID angka (bukan string) → error", () => {
    assert.throws(() => validateId(42), /Precondition violated/);
  });

  test("❌ ID lebih dari 1500 karakter → error too long", () => {
    assert.throws(() => validateId("x".repeat(1501)), /too long/);
  });

  test("✅ ID tepat 1500 karakter → masih valid", () => {
    assert.equal(validateId("x".repeat(1500)), true);
  });
});
