import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export function createAccessToken(id) {
  return jwt.sign({ id }, process.env.CUSTOM_SECRET_KEY, { expiresIn: "15m" });
}

export function createRefreshToken(id) {
  return jwt.sign({ id }, process.env.CUSTOM_SECRET_KEY, { expiresIn: "12h" });
}
