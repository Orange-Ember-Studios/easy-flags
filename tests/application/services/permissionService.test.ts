import { PermissionService } from "../../../src/application/services/permissionService";
import { createMockPermissionRepository, mockPermissions } from "../../setup";

describe("PermissionService", () => {
  let permissionService: PermissionService;
  let mockPermissionRepository: ReturnType<
    typeof createMockPermissionRepository
  >;

  beforeEach(() => {
    mockPermissionRepository = createMockPermissionRepository();
    permissionService = new PermissionService(mockPermissionRepository);
  });

  describe("listPermissions", () => {
    it("should return all permissions", async () => {
      const permissions = Object.values(mockPermissions);
      mockPermissionRepository.listAll.mockResolvedValue(permissions);

      const result = await permissionService.listPermissions();

      expect(mockPermissionRepository.listAll).toHaveBeenCalled();
      expect(result).toHaveLength(4);
      expect(result).toEqual(permissions);
    });

    it("should return empty array when no permissions exist", async () => {
      mockPermissionRepository.listAll.mockResolvedValue([]);

      const result = await permissionService.listPermissions();

      expect(result).toEqual([]);
    });
  });

  describe("createPermission", () => {
    it("should create a new permission", async () => {
      mockPermissionRepository.findByName.mockResolvedValue(null);

      await permissionService.createPermission(
        "NEW_PERMISSION",
        "New permission description",
      );

      expect(mockPermissionRepository.findByName).toHaveBeenCalledWith(
        "NEW_PERMISSION",
      );
      expect(mockPermissionRepository.create).toHaveBeenCalledWith(
        "NEW_PERMISSION",
        "New permission description",
      );
    });

    it("should throw error if permission already exists", async () => {
      mockPermissionRepository.findByName.mockResolvedValue(
        mockPermissions.createFeature,
      );

      await expect(
        permissionService.createPermission("CREATE_FEATURE", "desc"),
      ).rejects.toThrow('Permission "CREATE_FEATURE" already exists');

      expect(mockPermissionRepository.create).not.toHaveBeenCalled();
    });
  });

  describe("updatePermission", () => {
    it("should update an existing permission", async () => {
      mockPermissionRepository.findByName.mockResolvedValue(null);

      await permissionService.updatePermission(
        1,
        "UPDATED_PERMISSION",
        "Updated description",
      );

      expect(mockPermissionRepository.update).toHaveBeenCalledWith(
        1,
        "UPDATED_PERMISSION",
        "Updated description",
      );
    });

    it("should throw error if new permission name already exists for another permission", async () => {
      mockPermissionRepository.findByName.mockResolvedValue({
        id: 2,
        name: "DELETE_FEATURE",
        description: "desc",
      });

      await expect(
        permissionService.updatePermission(1, "DELETE_FEATURE", "desc"),
      ).rejects.toThrow('Permission "DELETE_FEATURE" already exists');
    });

    it("should allow updating permission with same name", async () => {
      mockPermissionRepository.findByName.mockResolvedValue({
        id: 1,
        name: "CREATE_FEATURE",
        description: "old desc",
      });

      await permissionService.updatePermission(
        1,
        "CREATE_FEATURE",
        "New description",
      );

      expect(mockPermissionRepository.update).toHaveBeenCalledWith(
        1,
        "CREATE_FEATURE",
        "New description",
      );
    });
  });

  describe("deletePermission", () => {
    it("should delete an existing permission", async () => {
      mockPermissionRepository.findById.mockResolvedValue(
        mockPermissions.createFeature,
      );

      await permissionService.deletePermission(1);

      expect(mockPermissionRepository.delete).toHaveBeenCalledWith(1);
    });

    it("should throw error if permission not found", async () => {
      mockPermissionRepository.findById.mockResolvedValue(null);

      await expect(permissionService.deletePermission(999)).rejects.toThrow(
        "Permission not found",
      );

      expect(mockPermissionRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe("getRolePermissions", () => {
    it("should return permissions for a role", async () => {
      const rolePermissions = [
        mockPermissions.createFeature,
        mockPermissions.deleteFeature,
      ];
      mockPermissionRepository.getRolePermissions.mockResolvedValue(
        rolePermissions,
      );

      const result = await permissionService.getRolePermissions(1);

      expect(mockPermissionRepository.getRolePermissions).toHaveBeenCalledWith(
        1,
      );
      expect(result).toHaveLength(2);
      expect(result).toEqual(rolePermissions);
    });

    it("should return empty array if role has no permissions", async () => {
      mockPermissionRepository.getRolePermissions.mockResolvedValue([]);

      const result = await permissionService.getRolePermissions(3);

      expect(result).toEqual([]);
    });
  });
});
