import { Request, Response, NextFunction } from "express";
import { verifyToken } from "./authMiddlewares";

/**
 * Middleware to protect page routes - check for valid auth token in cookie
 * Redirects unauthenticated users to login page
 */
export function pageAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const token = req.cookies.ff_token;
  if (!token) {
    return res.redirect("/");
  }
  try {
    const decoded = verifyToken(token);
    (req as any).user = decoded;
    next();
  } catch (err) {
    return res.redirect("/");
  }
}
