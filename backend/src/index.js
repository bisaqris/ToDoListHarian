import express from "express";
import cors from "cors";
import todoRoutes from "./routes/todo.routes.js";
import { initDatabase } from "./config/database.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/todos", todoRoutes);

const PORT = 5000;

const startServer = async () => {
  await initDatabase();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer().catch((error) => {
  console.error("Failed to start server:", error.message);
  process.exit(1);
});
