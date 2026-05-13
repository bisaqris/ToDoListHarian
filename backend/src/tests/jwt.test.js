import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { parseDuration } from "../utils/jwt.js";

describe("parseDuration (dari jwt.js)", () => {
  test("✅ '30s' → 30 detik", () => {
    assert.equal(parseDuration("30s"), 30);
  });

  test("✅ '5m' → 300 detik", () => {
    assert.equal(parseDuration("5m"), 300);
  });

  test("✅ '2h' → 7200 detik", () => {
    assert.equal(parseDuration("2h"), 7200);
  });

  test("✅ '1d' → 86400 detik", () => {
    assert.equal(parseDuration("1d"), 86400);
  });

  test("✅ '7d' → 604800 detik", () => {
    assert.equal(parseDuration("7d"), 604800);
  });

  test("✅ format tidak dikenali → default 86400 detik (1 hari)", () => {
    assert.equal(parseDuration("invalid"), 86400);
  });

  test("✅ string kosong → default 86400", () => {
    assert.equal(parseDuration(""), 86400);
  });
});
