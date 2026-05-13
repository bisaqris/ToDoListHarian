import * as service from "../services/todo.service.js";
import { success, error } from "../utils/response.js";
import { validateId, validateTodoData } from "../utils/validate.js";

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
    validateTodoData(req.body, false);

    const todo = await service.createTodo(req.body, req.user);
    console.log(todo)

    if (!todo) {
      throw new Error("Postcondition violated: created todo must have an id");
    }

    success(res, todo, 201);
  } catch (err) {
    const code = err.statusCode || 400;
    error(res, err.message, code, err.validationErrors || null);
  }
};

export const getAll = async (req, res) => {
  try {
    const todos = await service.getTodos(req.user);

    if (!Array.isArray(todos)) {
      throw new Error("Postcondition violated: getTodos must return an array");
    }

    success(res, todos);
  } catch (err) {
    error(res, err.message, 500);
  }
};

export const getById = async (req, res) => {
  try {
    validateId(req.params.id);

    const todo = await service.getTodoById(req.params.id, req.user);

    if (!todo) {
      return error(res, `Todo with id '${req.params.id}' not found`, 404);
    }

    success(res, todo);
  } catch (err) {
    const code = err.statusCode || 500;
    error(res, err.message, code);
  }
};

export const update = async (req, res) => {
  try {
    validateId(req.params.id);

    validateTodoData(req.body, true);

    if (Object.keys(req.body).length === 0) {
      return error(
        res,
        "Request body must contain at least one field to update",
        400,
      );
    }

    await service.updateTodo(req.params.id, req.body, req.user);

    success(res, { message: "Todo updated" });
  } catch (err) {
    const code = err.statusCode || 400;
    error(res, err.message, code, err.validationErrors || null);
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
    const transitions = await service.getTodoStatusTransitions(
      req.params.id,
      req.user,
    );

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
    validateId(req.params.id);

    await service.deleteTodo(req.params.id, req.user);

    success(res, { message: "Todo deleted" });
  } catch (err) {
    const code = err.statusCode || 500;
    error(res, err.message, code);
  }
};
