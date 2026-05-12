import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { buildParameterizedUpdate, createRowMapper } from "../utils/parameterized.js";

describe("buildParameterizedUpdate", () => {
  const fieldMap = {
    title: "title",
    priority: "priority",
    dueDate: "due_date",
  };

  test("✅ menghasilkan SET clause yang benar untuk satu field", () => {
    const result = buildParameterizedUpdate({ title: "Baru" }, fieldMap);
    assert.deepEqual(result.setClauses, ["title = $1"]);
    assert.deepEqual(result.values, ["Baru"]);
  });

  test("✅ menghasilkan SET clause untuk beberapa field sekaligus", () => {
    const result = buildParameterizedUpdate(
      { title: "A", priority: "high" },
      fieldMap,
    );
    assert.equal(result.setClauses.length, 2);
    assert.deepEqual(result.values, ["A", "high"]);
  });

  test("✅ field yang tidak ada di fieldMap diabaikan", () => {
    const result = buildParameterizedUpdate(
      { title: "Test", nonExistent: "ignored" },
      fieldMap,
    );
    assert.equal(result.entries.length, 1);
    assert.equal(result.setClauses[0], "title = $1");
  });

  test("✅ startIndex custom menggeser nomor parameter", () => {
    const result = buildParameterizedUpdate({ title: "X" }, fieldMap, 3);
    assert.equal(result.setClauses[0], "title = $3");
    assert.equal(result.nextIndex, 4);
  });

  test("✅ data kosong menghasilkan entries kosong", () => {
    const result = buildParameterizedUpdate({}, fieldMap);
    assert.equal(result.entries.length, 0);
    assert.equal(result.setClauses.length, 0);
    assert.equal(result.values.length, 0);
  });

  test("✅ nextIndex dihitung dengan benar", () => {
    const result = buildParameterizedUpdate(
      { title: "A", priority: "low", dueDate: "2025-01-01" },
      fieldMap,
      1,
    );
    assert.equal(result.nextIndex, 4);
  });
});

describe("createRowMapper", () => {
  const mapper = createRowMapper({
    id: (row) => String(row.id),
    title: "title",
    ownerName: (row) => row.owner_name || null,
    priority: "priority",
  });

  test("✅ memetakan kolom database ke response key dengan benar", () => {
    const row = { id: 5, title: "Tugas", owner_name: "Budi", priority: "high" };
    const result = mapper(row);
    assert.equal(result.id, "5");
    assert.equal(result.title, "Tugas");
    assert.equal(result.ownerName, "Budi");
    assert.equal(result.priority, "high");
  });

  test("✅ id di-cast ke string walau dari database berupa number", () => {
    const row = { id: 42, title: "X", owner_name: null, priority: "low" };
    assert.equal(typeof mapper(row).id, "string");
  });

  test("✅ owner_name null → ownerName null", () => {
    const row = { id: 1, title: "Y", owner_name: null, priority: "medium" };
    assert.equal(mapper(row).ownerName, null);
  });

  test("✅ mapper dapat dipakai berkali-kali untuk baris berbeda", () => {
    const rows = [
      { id: 1, title: "A", owner_name: "Ali", priority: "low" },
      { id: 2, title: "B", owner_name: "Budi", priority: "high" },
    ];
    const results = rows.map(mapper);
    assert.equal(results[0].id, "1");
    assert.equal(results[1].title, "B");
  });
});
