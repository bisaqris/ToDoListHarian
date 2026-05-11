import crypto from "crypto";
import { promisify } from "util";

const scrypt = promisify(crypto.scrypt);

export const hashPassword = async (password) => {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = await scrypt(password, salt, 64);
  return `${salt}:${derivedKey.toString("hex")}`;
};

export const verifyPassword = async (password, storedHash) => {
  const [salt, key] = storedHash.split(":");
  if (!salt || !key) return false;

  const derivedKey = await scrypt(password, salt, 64);
  return crypto.timingSafeEqual(Buffer.from(key, "hex"), derivedKey);
};
