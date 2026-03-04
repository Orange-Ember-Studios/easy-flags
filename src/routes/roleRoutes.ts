import express from "express";
import { RoleService } from "../application/services/roleService";
import { PermissionService } from "../application/services/permissionService";
import { asyncHandler } from "../utils/errorHandler";
import { HTTP_STATUS, ERROR_MESSAGES } from "../utils/constants";

export default function createRoleRouter(
  roleService: RoleService,
  permissionService: PermissionService,
) {
  const router = express.Router();

  // List all roles
  router.get("/", asyncHandler(async (req, res) => {
    const roles = await roleService.listRoles();
    res.json(roles);
  }));

  // Get role with permissions
  router.get("/:id", asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const role = await roleService.getRoleWithPermissions(id);
    if (!role) return res.status(HTTP_STATUS.NOT_FOUND).json({ error: ERROR_MESSAGES.ROLE_NOT_FOUND });
    res.json(role);
  }));

  // Create role
  router.post("/", asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    if (!name) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "Role name is required" });
    }
    await roleService.createRole(name, description);
    res.status(HTTP_STATUS.CREATED).json({ success: true });
  }));

  // Update role
  router.put("/:id", asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const { name, description } = req.body;
    if (!name) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "Role name is required" });
    }
    await roleService.updateRole(id, name, description);
    res.json({ success: true });
  }));

  // Delete role
  router.delete("/:id", asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    await roleService.deleteRole(id);
    res.json({ success: true });
  }));

  // Set role permissions
  router.post("/:id/permissions", asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const { permissionIds } = req.body;

    if (!Array.isArray(permissionIds)) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ error: "permissionIds must be an array" });
    }

    await roleService.setRolePermissions(id, permissionIds);
    res.json({ success: true });
  }));

  // Assign single permission to role
  router.post("/:roleId/permissions/:permissionId", asyncHandler(async (req, res) => {
    const roleId = Number(req.params.roleId);
    const permissionId = Number(req.params.permissionId);
    await roleService.assignPermissionToRole(roleId, permissionId);
    res.json({ success: true });
  }));

  // Remove permission from role
  router.delete("/:roleId/permissions/:permissionId", asyncHandler(async (req, res) => {
    const roleId = Number(req.params.roleId);
    const permissionId = Number(req.params.permissionId);
    await roleService.removePermissionFromRole(roleId, permissionId);
    res.json({ success: true });
  }));

  return router;
}
