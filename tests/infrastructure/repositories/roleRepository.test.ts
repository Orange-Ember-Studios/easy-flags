import { RoleRepository } from "../../../src/infrastructure/repositories/roleRepository";
import { mockRoles } from "../../setup";

jest.mock("../../../src/db", () => ({
  __esModule: true,
  default: jest.fn(async () => mockDb),
}));

const mockDb = {
  get: jest.fn(),
  all: jest.fn(),
  run: jest.fn(),
};

describe("RoleRepository", () => {
  let roleRepository: RoleRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    roleRepository = new RoleRepository();
  });

  describe("findById", () => {
    it("should find role by id", async () => {
      mockDb.get.mockResolvedValue(mockRoles.admin);

      const result = await roleRepository.findById(1);

      expect(mockDb.get).toHaveBeenCalled();
      expect(result).toEqual(mockRoles.admin);
    });

    it("should return undefined if role not found", async () => {
      mockDb.get.mockResolvedValue(undefined);

      const result = await roleRepository.findById(999);

      expect(result).toBeUndefined();
    });
  });

  describe("findByName", () => {
    it("should find role by name", async () => {
      mockDb.get.mockResolvedValue(mockRoles.admin);

      const result = await roleRepository.findByName("Admin");

      expect(mockDb.get).toHaveBeenCalled();
      expect(result).toEqual(mockRoles.admin);
    });
  });

  describe("listAll", () => {
    it("should return all roles sorted by name", async () => {
      mockDb.all.mockResolvedValue([
        mockRoles.admin,
        mockRoles.editor,
        mockRoles.viewer,
      ]);

      const result = await roleRepository.listAll();

      expect(mockDb.all).toHaveBeenCalled();
      const sql = (mockDb.all as jest.Mock).mock.calls[0][0];
      expect(sql).toContain("ORDER BY name");
      expect(result).toHaveLength(3);
    });
  });

  describe("create", () => {
    it("should create a role with description", async () => {
      await roleRepository.create("Custom Role", "Custom description");

      expect(mockDb.run).toHaveBeenCalled();
      const [sql, name, description] = (mockDb.run as jest.Mock).mock.calls[0];
      expect(sql).toContain("INSERT INTO roles");
      expect(name).toBe("Custom Role");
      expect(description).toBe("Custom description");
    });

    it("should create a role without description", async () => {
      await roleRepository.create("Custom Role");

      expect(mockDb.run).toHaveBeenCalled();
      const [, , description] = (mockDb.run as jest.Mock).mock.calls[0];
      expect(description).toBeNull();
    });
  });

  describe("update", () => {
    it("should update a role", async () => {
      await roleRepository.update(1, "Updated Admin", "Updated description");

      expect(mockDb.run).toHaveBeenCalled();
      const [sql, name, description, id] = (mockDb.run as jest.Mock).mock
        .calls[0];
      expect(sql).toContain("UPDATE roles");
      expect(name).toBe("Updated Admin");
      expect(description).toBe("Updated description");
      expect(id).toBe(1);
    });
  });

  describe("delete", () => {
    it("should delete role and its permissions", async () => {
      await roleRepository.delete(1);

      expect(mockDb.run).toHaveBeenCalledTimes(2);
      const firstCall = (mockDb.run as jest.Mock).mock.calls[0][0];
      const secondCall = (mockDb.run as jest.Mock).mock.calls[1][0];
      expect(firstCall).toContain("DELETE FROM role_permissions");
      expect(secondCall).toContain("DELETE FROM roles");
    });
  });

  describe("getRoleWithPermissions", () => {
    it("should return role with permissions", async () => {
      jest.clearAllMocks();
      const roleWithPerms = {
        ...mockRoles.admin,
        permissions: [
          { id: 1, name: "CREATE_FEATURE", description: "Create features" },
          { id: 2, name: "DELETE_FEATURE", description: "Delete features" },
        ],
      };
      // First call returns the role, second call returns permissions
      mockDb.get.mockResolvedValueOnce(mockRoles.admin);
      mockDb.all.mockResolvedValueOnce(roleWithPerms.permissions);

      const result = await roleRepository.getRoleWithPermissions(1);

      expect(mockDb.get).toHaveBeenCalled();
      expect(mockDb.all).toHaveBeenCalled();
      expect(result).toEqual(roleWithPerms);
      expect(result?.permissions).toHaveLength(2);
    });
  });
});
