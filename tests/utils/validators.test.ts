import { Request, Response, NextFunction } from "express";
import {
  validateUserInput,
  validateFeatureInput,
  validateFeatureValueInput,
} from "../../src/utils/validators";
import { HTTP_STATUS, ERROR_MESSAGES } from "../../src/utils/constants";

describe("Validators", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  describe("validateUserInput", () => {
    it("should call next if username and password are provided", () => {
      req.body = { username: "testuser", password: "password123" };

      validateUserInput(req as Request, res as Response, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it("should return error if username is missing", () => {
      req.body = { password: "password123" };

      validateUserInput(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        error: ERROR_MESSAGES.USERNAME_PASSWORD_REQUIRED,
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("should return error if password is missing", () => {
      req.body = { username: "testuser" };

      validateUserInput(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
      expect(next).not.toHaveBeenCalled();
    });

    it("should return error if both username and password are missing", () => {
      req.body = {};

      validateUserInput(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("validateFeatureInput", () => {
    it("should call next if key is provided without spaces", () => {
      req.body = { key: "BETA_FEATURE" };

      validateFeatureInput(req as Request, res as Response, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it("should return error if key is missing", () => {
      req.body = { description: "Beta feature" };

      validateFeatureInput(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        error: ERROR_MESSAGES.KEY_REQUIRED,
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("should return error if key contains spaces", () => {
      req.body = { key: "BETA FEATURE" };

      validateFeatureInput(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        error: ERROR_MESSAGES.KEY_NO_SPACES,
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("should return error for key with various whitespace characters", () => {
      const whitespaceKeys = ["BETA\nFEATURE", "BETA\tFEATURE", "BETA FEATURE"];

      whitespaceKeys.forEach((key) => {
        jest.clearAllMocks();
        req.body = { key };

        validateFeatureInput(req as Request, res as Response, next);

        expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
        expect(res.json).toHaveBeenCalledWith({
          error: ERROR_MESSAGES.KEY_NO_SPACES,
        });
      });
    });
  });

  describe("validateFeatureValueInput", () => {
    it("should call next if environmentId and boolean value are provided", () => {
      req.body = { environmentId: 1, value: true };

      validateFeatureValueInput(req as Request, res as Response, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it("should call next for false value", () => {
      req.body = { environmentId: 1, value: false };

      validateFeatureValueInput(req as Request, res as Response, next);

      expect(next).toHaveBeenCalled();
    });

    it("should return error if environmentId is missing", () => {
      req.body = { value: true };

      validateFeatureValueInput(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        error: ERROR_MESSAGES.ENVIRONMENT_ID_VALUE_REQUIRED,
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("should return error if value is not a boolean", () => {
      req.body = { environmentId: 1, value: "true" };

      validateFeatureValueInput(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
      expect(next).not.toHaveBeenCalled();
    });

    it("should return error if value is a number", () => {
      req.body = { environmentId: 1, value: 1 };

      validateFeatureValueInput(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
      expect(next).not.toHaveBeenCalled();
    });

    it("should return error if value is missing", () => {
      req.body = { environmentId: 1 };

      validateFeatureValueInput(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
      expect(next).not.toHaveBeenCalled();
    });
  });
});
