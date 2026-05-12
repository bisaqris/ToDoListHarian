import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { error, success } from "../utils/response.js";

describe("response helpers — success & error", () => {
  // Helper buat mock res
  const mockRes = () => {
    let captured = {};
    return {
      status(code) {
        captured.code = code;
        return this;
      },
      json(body) {
        captured.body = body;
        return this;
      },
      get captured() {
        return captured;
      },
    };
  };

  test("✅ success — status 200 dan body benar untuk object", () => {
    const res = mockRes();
    success(res, { id: "1", title: "Test" });
    assert.equal(res.captured.code, 200);
    assert.equal(res.captured.body.success, true);
    assert.equal(res.captured.body.data.title, "Test");
  });

  test("✅ success — status 201 saat create", () => {
    const res = mockRes();
    success(res, { id: "99" }, 201);
    assert.equal(res.captured.code, 201);
  });

  test("✅ success — data berupa array tetap diteruskan", () => {
    const res = mockRes();
    success(res, [{ id: "1" }, { id: "2" }]);
    assert.ok(Array.isArray(res.captured.body.data));
    assert.equal(res.captured.body.data.length, 2);
  });

  test("✅ error — status 400 dan pesan error benar", () => {
    const res = mockRes();
    error(res, "Validation failed", 400);
    assert.equal(res.captured.code, 400);
    assert.equal(res.captured.body.success, false);
    assert.equal(res.captured.body.error, "Validation failed");
  });

  test("✅ error — detail validasi ikut dalam response bila diberikan", () => {
    const res = mockRes();
    error(res, "Validation failed", 400, ["Field 'title' is required"]);
    assert.ok(Array.isArray(res.captured.body.details));
    assert.equal(res.captured.body.details[0], "Field 'title' is required");
  });

  test("✅ error — status 404 untuk not found", () => {
    const res = mockRes();
    error(res, "Todo not found", 404);
    assert.equal(res.captured.code, 404);
  });
});
