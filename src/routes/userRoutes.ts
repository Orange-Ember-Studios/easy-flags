import express, { Request, Response, NextFunction } from "express";
import { UserService } from "../application/services/userService";
import { asyncHandler } from "../utils/errorHandler";
import { validateUserInput } from "../utils/validators";
import { HTTP_STATUS, ERROR_MESSAGES } from "../utils/constants";

export default function createUserRouter(userService: UserService) {
  const router = express.Router();

  // List users with roles
  router.get("/", asyncHandler(async (req, res) => {
    const users = await userService.listUsersWithRoles();
    res.json(users);
  }));

  // Create user
  router.post("/", validateUserInput, asyncHandler(async (req, res) => {
    const { username, password, roleId } = req.body;
    await userService.createUser(username, password, roleId);
    res.status(HTTP_STATUS.CREATED).json({ success: true });
  }));

  // Get single user
  router.get("/:id", asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const u = await userService.findUser(id);
    if (!u) return res.status(HTTP_STATUS.NOT_FOUND).json({ error: ERROR_MESSAGES.USER_NOT_FOUND });
    res.json(u);
  }));

  // Update user
  router.put("/:id", asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const { username, password } = req.body;
    if (!username) return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: ERROR_MESSAGES.USERNAME_REQUIRED });
    await userService.updateUser(id, username, password);
    res.json({ success: true });
  }));

  // Assign role to user
  router.post("/:id/role/:roleId", asyncHandler(async (req, res) => {
    const userId = Number(req.params.id);
    const roleId = Number(req.params.roleId);
    await userService.assignRoleToUser(userId, roleId);
    res.json({ success: true });
  }));

  // Remove role from user
  router.delete("/:id/role", asyncHandler(async (req, res) => {
    const userId = Number(req.params.id);
    await userService.removeRoleFromUser(userId);
    res.json({ success: true });
  }));

  // Delete user
  router.delete("/:id", asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    await userService.deleteUser(id);
    // Check if user still exists
    const user = await userService.findUser(id);
    if (user) {
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: ERROR_MESSAGES.USER_NOT_DELETED });
    }
    res.json({ success: true });
  }));

  return router;
}
