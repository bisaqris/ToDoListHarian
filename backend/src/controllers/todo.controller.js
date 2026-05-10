import * as service from "../services/todo.service.js";
import { success } from "../utils/response.js";

export const create = async (req, res) => {
  try {
    const todo = await service.createTodo(req.body);
    success(res, todo, 201);
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getAll = async (req, res) => {
  try {
    const todos = await service.getTodos();
    success(res, todos);
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const update = async (req, res) => {
  try {
    const todo = await service.updateTodo(req.params.id, req.body);

    if (!todo) {
      return res.status(404).json({ success: false, error: "Todo not found" });
    }

    success(res, todo);
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const remove = async (req, res) => {
  try {
    const deleted = await service.deleteTodo(req.params.id);

    if (!deleted) {
      return res.status(404).json({ success: false, error: "Todo not found" });
    }

    success(res, { message: "Todo deleted" });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
