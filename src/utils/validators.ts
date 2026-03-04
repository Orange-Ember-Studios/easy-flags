import { Request, Response, NextFunction } from "express";
import { HTTP_STATUS, ERROR_MESSAGES } from "./constants";

// Middleware to validate user creation/update
export const validateUserInput = (req: Request, res: Response, next: NextFunction) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res
      .status(HTTP_STATUS.BAD_REQUEST)
      .json({ error: ERROR_MESSAGES.USERNAME_PASSWORD_REQUIRED });
  }
  
  next();
};

// Middleware to validate feature creation
export const validateFeatureInput = (req: Request, res: Response, next: NextFunction) => {
  const { key } = req.body;
  
  if (!key) {
    return res
      .status(HTTP_STATUS.BAD_REQUEST)
      .json({ error: ERROR_MESSAGES.KEY_REQUIRED });
  }
  
  if (/\s/.test(key)) {
    return res
      .status(HTTP_STATUS.BAD_REQUEST)
      .json({ error: ERROR_MESSAGES.KEY_NO_SPACES });
  }
  
  next();
};

// Middleware to validate feature value input
export const validateFeatureValueInput = (req: Request, res: Response, next: NextFunction) => {
  const { environmentId, value } = req.body;
  
  if (!environmentId || typeof value !== "boolean") {
    return res
      .status(HTTP_STATUS.BAD_REQUEST)
      .json({ error: ERROR_MESSAGES.ENVIRONMENT_ID_VALUE_REQUIRED });
  }
  
  next();
};
