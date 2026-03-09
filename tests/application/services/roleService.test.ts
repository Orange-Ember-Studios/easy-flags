import { RoleService } from "../../../src/application/services/roleService";
import {
  createMockRoleRepository,
  createMockPermissionRepository,
  mockRoles,
  mockPermissions,
} from "../../setup";

describe("RoleService", () => {
  let roleService: RoleService;
  let mockRoleRepository: ReturnType<typeof createMockRoleRepository>;
  let mockPermissionRepository: ReturnType<
    typeof createMockPermissionRepository
  >;

  beforeEach(() => {
    mockRoleRepository = createMockRoleRepository();
    mockPermissionRepository = createMockPermissionRepository();
    roleService = new RoleService(mockRoleRepository, mockPermissionRepository);
  });

  describe("listRoles", () => {
    it("should return all roles", async () => {
      const roles = [mockRoles.admin, mockRoles.editor, mockRoles.viewer];
      mockRoleRepository.listAll.mockResolvedValue(roles);

      const result = await roleService.listRoles();

      expect(mockRoleRepository.listAll).toHaveBeenCalled();
      expect(result).toHaveLength(3);
      expect(result).toEqual(roles);
    });

    it("should return empty array when no roles exist", async () => {
      mockRoleRepository.listAll.mockResolvedValue([]);

      const result = await roleService.listRoles();

      expect(result).toEqual([]);
    });
  });

  describe("getRoleWithPermissions", () => {
    it("should return role with its permissions", async () => {
      const roleWithPermissions = {
        ...mockRoles.admin,
        permissions: [
          mockPermissions.createFeature,
          mockPermissions.deleteFeature,
        ],
      };
      mockRoleRepository.getRoleWithPermissions.mockResolvedValue(
        roleWithPermissions,
      );

      const result = await roleService.getRoleWithPermissions(1);

      expect(mockRoleRepository.getRoleWithPermissions).toHaveBeenCalledWith(1);
      expect(result).toEqual(roleWithPermissions);
      expect(result?.permissions).toHaveLength(2);
    });

    it("should return null if role not found", async () => {
      mockRoleRepository.getRoleWithPermissions.mockResolvedValue(null);

      const result = await roleService.getRoleWithPermissions(999);

      expect(result).toBeNull();
    });
  });

  describe("createRole", () => {
    it("should create a new role", async () => {
      mockRoleRepository.findByName.mockResolvedValue(null);

      await roleService.createRole("Custom Role", "Custom role description");

      expect(mockRoleRepository.findByName).toHaveBeenCalledWith("Custom Role");
      expect(mockRoleRepository.create).toHaveBeenCalledWith(
        "Custom Role",
        "Custom role description",
      );
    });

    it("should throw error if role already exists", async () => {
      mockRoleRepository.findByName.mockResolvedValue(mockRoles.admin);

      await expect(
        roleService.createRole("Admin", "Duplicate role"),
      ).rejects.toThrow('Role "Admin" already exists');

      expect(mockRoleRepository.create).not.toHaveBeenCalled();
    });
  });

  describe("updateRole", () => {
    it("should update an existing role", async () => {
      mockRoleRepository.findByName.mockResolvedValue(null);

      await roleService.updateRole(1, "Updated Admin", "Updated description");

      expect(mockRoleRepository.update).toHaveBeenCalledWith(
        1,
        "Updated Admin",
        "Updated description",
      );
    });

    it("should throw error if new role name already exists for another role", async () => {
      mockRoleRepository.findByName.mockResolvedValue({
        ...mockRoles.editor,
        id: 2,
      });

      await expect(roleService.updateRole(1, "Editor", "desc")).rejects.toThrow(
        'Role "Editor" already exists',
      );
    });

    it("should allow updating role with same name", async () => {
      mockRoleRepository.findByName.mockResolvedValue({
        ...mockRoles.admin,
        id: 1,
      });

      await roleService.updateRole(1, "Admin", "New description");

      expect(mockRoleRepository.update).toHaveBeenCalledWith(
        1,
        "Admin",
        "New description",
      );
    });
  });

  describe("deleteRole", () => {
    it("should delete a custom role", async () => {
      const customRole = { id: 4, name: "Custom", description: "Custom role" };
      mockRoleRepository.findById.mockResolvedValue(customRole);

      await roleService.deleteRole(4);

      expect(mockRoleRepository.delete).toHaveBeenCalledWith(4);
    });

    it("should prevent deletion of Admin role", async () => {
      mockRoleRepository.findById.mockResolvedValue(mockRoles.admin);

      await expect(roleService.deleteRole(1)).rejects.toThrow(
        'Cannot delete default role "Admin"',
      );

      expect(mockRoleRepository.delete).not.toHaveBeenCalled();
    });

    it("should prevent deletion of Editor role", async () => {
      mockRoleRepository.findById.mockResolvedValue(mockRoles.editor);

      await expect(roleService.deleteRole(2)).rejects.toThrow(
        'Cannot delete default role "Editor"',
      );
    });

    it("should prevent deletion of Viewer role", async () => {
      mockRoleRepository.findById.mockResolvedValue(mockRoles.viewer);

      await expect(roleService.deleteRole(3)).rejects.toThrow(
        'Cannot delete default role "Viewer"',
      );
    });
  });

  describe("assignPermissionToRole", () => {
    it("should assign permission to role", async () => {
      mockRoleRepository.findById.mockResolvedValue(mockRoles.admin);
      mockPermissionRepository.findById.mockResolvedValue(
        mockPermissions.createFeature,
      );

      await roleService.assignPermissionToRole(1, 1);

      expect(mockPermissionRepository.assignToRole).toHaveBeenCalledWith(1, 1);
    });

    it("should throw error if role not found", async () => {
      mockRoleRepository.findById.mockResolvedValue(null);

      await expect(roleService.assignPermissionToRole(999, 1)).rejects.toThrow(
        "Role not found",
      );
    });

    it("should throw error if permission not found", async () => {
      mockRoleRepository.findById.mockResolvedValue(mockRoles.admin);
      mockPermissionRepository.findById.mockResolvedValue(null);

      await expect(roleService.assignPermissionToRole(1, 999)).rejects.toThrow(
        "Permission not found",
      );
    });
  });

  describe("removePermissionFromRole", () => {
    it("should remove permission from role", async () => {
      mockRoleRepository.findById.mockResolvedValue(mockRoles.admin);
      mockPermissionRepository.findById.mockResolvedValue(
        mockPermissions.createFeature,
      );

      await roleService.removePermissionFromRole(1, 1);

      expect(mockPermissionRepository.removeFromRole).toHaveBeenCalledWith(
        1,
        1,
      );
    });

    it("should throw error if role not found", async () => {
      mockRoleRepository.findById.mockResolvedValue(null);

      await expect(
        roleService.removePermissionFromRole(999, 1),
      ).rejects.toThrow("Role not found");
    });

    it("should throw error if permission not found", async () => {
      mockRoleRepository.findById.mockResolvedValue(mockRoles.admin);
      mockPermissionRepository.findById.mockResolvedValue(null);

      await expect(
        roleService.removePermissionFromRole(1, 999),
      ).rejects.toThrow("Permission not found");
    });
  });

  describe("setRolePermissions", () => {
    it("should set all permissions for a role", async () => {
      mockRoleRepository.findById.mockResolvedValue(mockRoles.admin);
      mockPermissionRepository.getRolePermissions.mockResolvedValue([
        mockPermissions.createFeature,
        mockPermissions.deleteFeature,
      ]);
      // returnValue needs to be setup for findById calls
      mockPermissionRepository.findById.mockResolvedValue(
        mockPermissions.editFeature,
      );

      await roleService.setRolePermissions(1, [1, 2, 3]);

      expect(mockPermissionRepository.assignToRole).toHaveBeenCalledWith(1, 3);
    });

    it("should remove permissions not in the new list", async () => {
      mockRoleRepository.findById.mockResolvedValue(mockRoles.admin);
      mockPermissionRepository.getRolePermissions.mockResolvedValue([
        { id: 1, name: "CREATE_FEATURE" },
        { id: 2, name: "DELETE_FEATURE" },
      ]);
      mockPermissionRepository.findById.mockResolvedValue(
        mockPermissions.createFeature,
      );

      await roleService.setRolePermissions(1, [1]);

      expect(mockPermissionRepository.removeFromRole).toHaveBeenCalledWith(
        1,
        2,
      );
    });

    it("should throw error if role not found", async () => {
      mockRoleRepository.findById.mockResolvedValue(null);

      await expect(roleService.setRolePermissions(999, [1, 2])).rejects.toThrow(
        "Role not found",
      );
    });
  });
});
