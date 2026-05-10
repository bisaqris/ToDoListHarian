import * as service from "../services/category.service.js";
import { success } from "../utils/response.js";

export const getAll = async (req, res) => {
  try {
    const categories = await service.getCategories();
    success(res, categories);
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const create = async (req, res) => {
  try {
    const category = await service.createCategory(req.body, req.user);
    success(res, category, 201);
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
