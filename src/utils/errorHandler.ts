import { Request, Response, NextFunction } from "express";

// Centralized error handling middleware
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  // Log error (can be replaced with a logger later)
  console.error(`[Error] ${statusCode}: ${message}`, err.stack);

  res.status(statusCode).json({ error: message });
};

// Async wrapper to catch errors in async route handlers
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>,
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
