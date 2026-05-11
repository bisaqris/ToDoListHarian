import { getActivities } from "../services/activity.service.js";
import { success } from "../utils/response.js";

export const getAll = async (req, res) => {
  try {
    const activities = await getActivities(req.user);
    success(res, activities);
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
