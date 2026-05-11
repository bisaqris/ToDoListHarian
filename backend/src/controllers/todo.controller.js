import * as service from "../services/todo.service.js";
import { success } from "../utils/response.js";
import { validateId, validateTodoData } from "../utils/validate.js";

export const create = async (req, res) => {
  try {
    // [DbC — Precondition] Validasi body request dulu sebelum lanjut ke service
    // isUpdate=false artinya field "title" wajib ada
    validateTodoData(req.body, false);

    const todo = await service.createTodo(req.body);

    // [DbC — Postcondition] Setelah service jalan, pastikan hasilnya valid
    // Kalau id tidak ada, berarti ada yang salah di service layer
    if (!todo || !todo.id) {
      throw new Error("Postcondition violated: created todo must have an id");
    }

    // [Code Reuse] Kirim response sukses dengan status 201 Created
    success(res, todo, 201);
  } catch (err) {
    const code = err.statusCode || 400;
    // [Code Reuse] Kirim response error beserta detail validasinya kalau ada
    error(res, err.message, code, err.validationErrors || null);
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

export const getById = async (req, res) => {
  try {
    validateId(req.params.id);

    const todo = await service.getTodoById(req.params.id);

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
    // [DbC — Precondition] Validasi ID dan body sebelum apapun dieksekusi
    validateId(req.params.id);
    validateTodoData(req.body, true); // isUpdate=true → semua field opsional

    // [Defensive Programming] Body tidak boleh kosong saat update
    // Kalau kosong, tidak ada yang diupdate — lebih baik langsung tolak
    if (Object.keys(req.body).length === 0) {
      return error(
        res,
        "Request body must contain at least one field to update",
        400,
      );
    }

    await service.updateTodo(req.params.id, req.body);
    success(res, { message: "Todo updated" });
  } catch (err) {
    const code = err.statusCode || 400;
    error(res, err.message, code, err.validationErrors || null);
  }
};

export const remove = async (req, res) => {
  try {
    // [DbC — Precondition] Validasi ID dulu sebelum minta service hapus data
    validateId(req.params.id);

    await service.deleteTodo(req.params.id);
    success(res, { message: "Todo deleted" });
  } catch (err) {
    const code = err.statusCode || 500;
    error(res, err.message, code);
  }
};
