import * as service from "../services/auth.service.js";
import { success } from "../utils/response.js";

export const register = async (req, res) => {
  try {
    const user = await service.registerUser(req.body);
    success(res, user, 201);
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const session = await service.loginUser(req.body);
    success(res, session);
  } catch (error) {
    res.status(401).json({ success: false, error: error.message });
  }
};

export const me = async (req, res) => {
  success(res, req.user);
};
