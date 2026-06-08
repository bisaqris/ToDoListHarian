import express from "express";
import cors from "cors";
import todoRoutes from "./routes/todo.routes.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import activityRoutes from "./routes/activity.routes.js";
import reportRoutes from "./routes/report.routes.js";
import { initDatabase } from "./config/database.js";
import { runDailyRecap } from "./services/report.service.js";
import dotenv from "dotenv/config";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/todos", todoRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/report", reportRoutes);

const PORT = 3000;

const scheduleDailyRecap = () => {
  const runAtMidnight = () => {
    const now = new Date();
    const nextMidnight = new Date(now);
    nextMidnight.setDate(now.getDate() + 1);
    nextMidnight.setHours(0, 1, 0, 0); // jam 00:01:00

    const msUntilMidnight = nextMidnight.getTime() - now.getTime();

    console.log(
      `[Cron] Daily recap dijadwalkan dalam ${Math.round(msUntilMidnight / 1000 / 60)} menit (jam 00:01)`
    );

    setTimeout(async () => {
      try {
        console.log("[Cron] Menjalankan daily recap otomatis...");
        await runDailyRecap();
      } catch (err) {
        console.error("[Cron] Gagal menjalankan daily recap:", err.message);
      }

      runAtMidnight();
    }, msUntilMidnight);
  };

  runAtMidnight();
};

const startServer = async () => {
  await initDatabase();

  scheduleDailyRecap();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer().catch((error) => {
  console.error("Failed to start server:", error.message);
  process.exit(1);
});
