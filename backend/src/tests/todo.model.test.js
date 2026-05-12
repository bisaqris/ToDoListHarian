import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { TodoModel } from "../models/todo.model.js";

describe("TodoModel", () => {
  test("✅ membuat model dengan data lengkap", () => {
    const model = TodoModel({
      title: "Test",
      description: "Desc",
      completed: true,
      priority: "high",
      category: "work",
      dueDate: "2025-12-31",
      dueTime: "09:00",
    });
    assert.equal(model.title, "Test");
    assert.equal(model.description, "Desc");
    assert.equal(model.completed, true);
    assert.equal(model.priority, "high");
    assert.equal(model.category, "work");
    assert.equal(model.dueDate, "2025-12-31");
    assert.equal(model.dueTime, "09:00");
  });

  test("✅ description default ke string kosong bila tidak diisi", () => {
    const model = TodoModel({ title: "X" });
    assert.equal(model.description, "");
  });

  test("✅ completed default false bila tidak diisi", () => {
    const model = TodoModel({ title: "X" });
    assert.equal(model.completed, false);
  });

  test("✅ priority default 'medium' bila tidak diisi", () => {
    const model = TodoModel({ title: "X" });
    assert.equal(model.priority, "medium");
  });

  test("✅ category default 'general' bila tidak diisi", () => {
    const model = TodoModel({ title: "X" });
    assert.equal(model.category, "general");
  });

  test("✅ dueDate default null bila tidak diisi", () => {
    const model = TodoModel({ title: "X" });
    assert.equal(model.dueDate, null);
  });

  test("✅ dueTime default null bila tidak diisi", () => {
    const model = TodoModel({ title: "X" });
    assert.equal(model.dueTime, null);
  });

  test("✅ createdAt bertipe Date dan mendekati waktu sekarang", () => {
    const before = Date.now();
    const model = TodoModel({ title: "X" });
    const after = Date.now();
    assert.ok(model.createdAt instanceof Date);
    assert.ok(model.createdAt.getTime() >= before);
    assert.ok(model.createdAt.getTime() <= after);
  });

  test("✅ completed = false tidak di-override oleh default (falsy check)", () => {
    const model = TodoModel({ title: "X", completed: false });
    assert.equal(model.completed, false);
  });
});
