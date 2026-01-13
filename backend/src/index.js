import express from "express";
import cors from "cors";
import todoRoutes from "./routes/todo.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/todos", todoRoutes);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
