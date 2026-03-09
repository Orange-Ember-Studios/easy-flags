import { Request, Response, NextFunction } from "express";
import { errorHandler, asyncHandler } from "../../src/utils/errorHandler";

describe("ErrorHandler", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
    // Suppress console.error during tests
    jest.spyOn(console, "error").mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("errorHandler", () => {
    it("should handle error with statusCode", () => {
      const error = {
        statusCode: 404,
        message: "Not Found",
        stack: "Error stack trace",
      };

      errorHandler(error, req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Not Found" });
    });

    it("should handle error without statusCode (default to 500)", () => {
      const error = {
        message: "Internal Server Error",
        stack: "Error stack trace",
      };

      errorHandler(error, req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Internal Server Error" });
    });

    it("should handle error with no message (use default)", () => {
      const error = {
        statusCode: 500,
      };

      errorHandler(error, req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Internal Server Error" });
    });

    it("should log error to console", () => {
      const error = {
        statusCode: 400,
        message: "Bad Request",
        stack: "Error stack",
      };

      errorHandler(error, req as Request, res as Response, next);

      expect(console.error).toHaveBeenCalled();
    });

    it("should handle string errors", () => {
      const error = "String error message";

      errorHandler(error, req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("asyncHandler", () => {
    it("should wrap async function and call next on error", async () => {
      const asyncFn = jest.fn().mockRejectedValue(new Error("Async error"));
      const wrapped = asyncHandler(asyncFn);

      await wrapped(req as Request, res as Response, next);

      expect(asyncFn).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

    it("should call async function successfully", async () => {
      const asyncFn = jest.fn().mockResolvedValue(undefined);
      const wrapped = asyncHandler(asyncFn);

      await wrapped(req as Request, res as Response, next);

      expect(asyncFn).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it("should pass request, response, and next to async function", async () => {
      const asyncFn = jest.fn().mockResolvedValue(undefined);
      const wrapped = asyncHandler(asyncFn);

      await wrapped(req as Request, res as Response, next);

      expect(asyncFn).toHaveBeenCalledWith(req, res, next);
    });

    it("should catch synchronous errors in async function", async () => {
      const error = new Error("Sync error in async function");
      const asyncFn = jest.fn().mockImplementation(() => {
        return Promise.reject(error);
      });
      const wrapped = asyncHandler(asyncFn);

      await wrapped(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });

    it("should handle rejected promises", async () => {
      const error = new Error("Promise rejected");
      const asyncFn = jest.fn().mockImplementation(() => Promise.reject(error));
      const wrapped = asyncHandler(asyncFn);

      await wrapped(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
