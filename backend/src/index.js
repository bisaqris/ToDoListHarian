import express from "express";
import cors from "cors";
import todoRoutes from "./routes/todo.routes.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import activityRoutes from "./routes/activity.routes.js";
import { initDatabase } from "./config/database.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/todos", todoRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/activity", activityRoutes);

const PORT = 3000;

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
