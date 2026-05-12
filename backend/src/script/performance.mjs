import { performance } from "node:perf_hooks";

import { TodoModel } from "../src/models/todo.model.js";
import { createRowMapper, buildParameterizedUpdate } from "../src/utils/parameterized.js";
import { signToken, verifyToken } from "../src/utils/jwt.js";

process.env.JWT_SECRET = "performance-benchmark-secret";

const sampleTodoData = {
  title: "Rekap laporan mingguan",
  description: "Perbarui data progres tugas",
  category: "work",
  priority: "high",
  dueDate: "2026-05-11",
  dueTime: "09:30",
};

const sampleRow = {
  id: 1,
  title: "Rekap laporan mingguan",
  status_name: "Menunggu",
  status: "pending",
};

const mapTodo = createRowMapper({
  id: (row) => String(row.id),
  title: "title",
  statusName: (row) => row.status_name || row.status,
});

const sampleToken = signToken({ sub: "1", roles: ["admin"] }, "1h");

const runBenchmark = (name, iterations, operation) => {
  const start = performance.now();

  for (let index = 0; index < iterations; index += 1) {
    operation(index);
  }

  const totalMs = performance.now() - start;

  return {
    name,
    iterations,
    totalMs: Number(totalMs.toFixed(2)),
    avgUs: Number(((totalMs * 1000) / iterations).toFixed(3)),
  };
};

const results = [
  runBenchmark("TodoModel", 500000, () => TodoModel(sampleTodoData)),
  runBenchmark("createRowMapper", 500000, () => mapTodo(sampleRow)),
  runBenchmark("buildParameterizedUpdate", 250000, () =>
    buildParameterizedUpdate(
      sampleTodoData,
      {
        title: "title",
        description: "description",
        category: "category",
        priority: "priority",
        dueDate: "due_date",
        dueTime: "due_time",
      },
    ),
  ),
  runBenchmark("signToken", 25000, () => signToken({ sub: "1", roles: ["admin"] }, "1h")),
  runBenchmark("verifyToken", 25000, () => verifyToken(sampleToken)),
];

console.table(results);