import { listUsers } from "../services/auth.service.js";
import { success } from "../utils/response.js";

export const getAll = async (req, res) => {
  try {
    const users = await listUsers();
    success(res, users);
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
