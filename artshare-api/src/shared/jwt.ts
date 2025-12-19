import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET!;

export function generateToken(payload: any) {
  return jwt.sign(payload, SECRET, { expiresIn: "7d" });
}
