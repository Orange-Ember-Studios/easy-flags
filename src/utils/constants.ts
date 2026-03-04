// Error Messages
export const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: "Invalid credentials",
  USERNAME_PASSWORD_REQUIRED: "Username and password required",
  USERNAME_REQUIRED: "Username required",
  PASSWORD_REQUIRED: "Password required",
  ALL_FIELDS_REQUIRED: "All fields are required.",
  KEY_REQUIRED: "Key required",
  KEY_NO_SPACES: "Key cannot contain spaces",
  FEATURE_NOT_FOUND: "Feature not found",
  USER_NOT_FOUND: "User not found",
  ROLE_NOT_FOUND: "Role not found",
  ENVIRONMENT_NOT_FOUND: "Environment not found",
  ENVIRONMENT_ID_VALUE_REQUIRED: "environmentId and boolean value required",
  USER_NOT_DELETED: "User was not deleted.",
  REGISTRATION_FAILED: "Registration failed.",
  INTERNAL_SERVER_ERROR: "Internal Server Error",
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

// Success Messages
export const SUCCESS_MESSAGES = {
  SUCCESS: "success",
  USER_CREATED: "User created successfully",
  FEATURE_CREATED: "Feature created successfully",
};
