import express from "express";
import { PermissionService } from "../application/services/permissionService";
import { asyncHandler } from "../utils/errorHandler";
import { HTTP_STATUS } from "../utils/constants";
import { ok, created, fail } from "../utils/apiResponse";

export default function createPermissionRouter(
  permissionService: PermissionService,
) {
  const router = express.Router();

  // List all permissions
  router.get("/", asyncHandler(async (req, res) => {
    const permissions = await permissionService.listPermissions();
    res.json(ok(permissions));
  }));

  // Create permission
  router.post("/", asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    if (!name) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(fail("PERMISSION_NAME_REQUIRED", "Permission name is required"));
    }
    await permissionService.createPermission(name, description);
    res.status(HTTP_STATUS.CREATED).json(created({}));
  }));

  // Update permission
  router.put("/:id", asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const { name, description } = req.body;
    if (!name) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(fail("PERMISSION_NAME_REQUIRED", "Permission name is required"));
    }
    await permissionService.updatePermission(id, name, description);
    res.json(ok({}));
  }));

  // Delete permission
  router.delete("/:id", asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    await permissionService.deletePermission(id);
    res.json(ok({}));
  }));

  // Get role permissions
  router.get("/role/:roleId", asyncHandler(async (req, res) => {
    const roleId = Number(req.params.roleId);
    const permissions = await permissionService.getRolePermissions(roleId);
    res.json(ok(permissions));
  }));

  return router;
}
