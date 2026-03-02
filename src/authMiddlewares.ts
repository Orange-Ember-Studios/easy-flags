import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "change-me";

export function signToken(payload: object) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "8h" });
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET);
}

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // Check for token in Authorization header first, then in cookies
  let token: string | undefined;

  const header = req.headers.authorization;
  if (header) {
    const parts = header.split(" ");
    if (parts.length === 2 && parts[0] === "Bearer") {
      token = parts[1];
    }
  }

  // Fallback to cookie-based authentication
  if (!token) {
    token = (req.cookies as any).ff_token;
  }

  if (!token) {
    return res.status(401).json({ error: "Missing authorization" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    (req as any).user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}
