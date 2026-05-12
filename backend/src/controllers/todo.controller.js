import * as service from "../services/todo.service.js";
import { success } from "../utils/response.js";

// Fungsi Report Bulanan
export const getStats = async (req, res) => {
  try {
    const stats = await service.getMonthlyStats(req.user);
    success(res, stats, 200, "Monthly statistics retrieved successfully");
  } catch (error) {
    res.status(500).json({success: false, error: error.message});
  }
};

export const create = async (req, res) => {
  try {
    const todo = await service.createTodo(req.body, req.user);
    success(res, todo, 201);
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getAll = async (req, res) => {
  try {
    const todos = await service.getTodos(req.user);
    success(res, todos);
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const update = async (req, res) => {
  try {
    const todo = await service.updateTodo(req.params.id, req.body, req.user);

    if (!todo) {
      return res.status(404).json({ success: false, error: "Todo not found" });
    }

    success(res, todo);
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const transitionStatus = async (req, res) => {
  try {
    const todo = await service.transitionTodoStatus(
      req.params.id,
      req.body.event,
      req.user,
    );

    if (!todo) {
      return res.status(404).json({ success: false, error: "Todo not found" });
    }

    success(res, todo);
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getTransitions = async (req, res) => {
  try {
    const transitions = await service.getTodoStatusTransitions(req.params.id, req.user);

    if (!transitions) {
      return res.status(404).json({ success: false, error: "Todo not found" });
    }

    success(res, transitions);
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const remove = async (req, res) => {
  try {
    const deleted = await service.deleteTodo(req.params.id, req.user);

    if (!deleted) {
      return res.status(404).json({ success: false, error: "Todo not found" });
    }

    success(res, { message: "Todo deleted" });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
