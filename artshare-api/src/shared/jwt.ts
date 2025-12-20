import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET!;

// ✅ Create JWT
export function generateToken(payload: any) {
  return jwt.sign(payload, SECRET, { expiresIn: "7d" });
}

// ✅ Verify JWT
export function verifyToken(token: string): any | null {
  try {
    return jwt.verify(token, SECRET);
  } catch (err) {
    return null;
  }
}
