import { verifyToken } from "../utils/jwt.js";
import { getUserById } from "../services/auth.service.js";

export const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ success: false, error: "Authentication required" });
    }

    const payload = verifyToken(token);
    const user = await getUserById(payload.sub);

    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, error: "Invalid user session" });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ success: false, error: error.message });
  }
};

export const authorizeRoles = (...allowedRoles) => (req, res, next) => {
  const hasRole = req.user?.roles?.some((role) => allowedRoles.includes(role));

  if (!hasRole) {
    return res.status(403).json({ success: false, error: "Insufficient role access" });
  }

  next();
};
