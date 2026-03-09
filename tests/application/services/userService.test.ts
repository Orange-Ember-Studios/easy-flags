import { UserService } from "../../../src/application/services/userService";
import { createMockUserRepository, mockUsers, mockRoles } from "../../setup";

describe("UserService", () => {
  let userService: UserService;
  let mockUserRepository: ReturnType<typeof createMockUserRepository>;

  beforeEach(() => {
    mockUserRepository = createMockUserRepository();
    userService = new UserService(mockUserRepository);
  });

  describe("listUsers", () => {
    it("should return a list of users without passwords", async () => {
      const users = [mockUsers.admin, mockUsers.editor, mockUsers.viewer];
      mockUserRepository.listAll.mockResolvedValue(users);

      const result = await userService.listUsers();

      expect(mockUserRepository.listAll).toHaveBeenCalled();
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        id: mockUsers.admin.id,
        username: mockUsers.admin.username,
        role_id: mockUsers.admin.role_id,
      });
      expect(result[0]).not.toHaveProperty("password");
    });

    it("should return empty array when no users exist", async () => {
      mockUserRepository.listAll.mockResolvedValue([]);

      const result = await userService.listUsers();

      expect(result).toEqual([]);
    });
  });

  describe("listUsersWithRoles", () => {
    it("should return users with their role information", async () => {
      const usersWithRoles = [
        { ...mockUsers.admin, role: mockRoles.admin },
        { ...mockUsers.editor, role: mockRoles.editor },
      ];
      mockUserRepository.listAllWithRoles.mockResolvedValue(usersWithRoles);

      const result = await userService.listUsersWithRoles();

      expect(mockUserRepository.listAllWithRoles).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0].role).toEqual(mockRoles.admin);
    });
  });

  describe("createUser", () => {
    it("should create a user with hashed password", async () => {
      await userService.createUser("newuser", "password123", 2);

      expect(mockUserRepository.create).toHaveBeenCalled();
      const [username, password, roleId] = (
        mockUserRepository.create as jest.Mock
      ).mock.calls[0];
      expect(username).toBe("newuser");
      expect(password).toMatch(/^\$2a\$/); // bcrypt hash
      expect(roleId).toBe(2);
    });

    it("should create a user without role if roleId is not provided", async () => {
      await userService.createUser("newuser", "password123");

      expect(mockUserRepository.create).toHaveBeenCalled();
      const [, , roleId] = (mockUserRepository.create as jest.Mock).mock
        .calls[0];
      expect(roleId).toBeUndefined();
    });
  });

  describe("findUser", () => {
    it("should return user without password", async () => {
      mockUserRepository.findById.mockResolvedValue(mockUsers.admin);

      const result = await userService.findUser(1);

      expect(mockUserRepository.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual({
        id: mockUsers.admin.id,
        username: mockUsers.admin.username,
        role_id: mockUsers.admin.role_id,
      });
      expect(result).not.toHaveProperty("password");
    });

    it("should return null if user not found", async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      const result = await userService.findUser(999);

      expect(result).toBeNull();
    });
  });

  describe("updateUser", () => {
    it("should update user with new password", async () => {
      await userService.updateUser(1, "newusername", "newpassword");

      expect(mockUserRepository.update).toHaveBeenCalled();
      const [id, username, password] = (mockUserRepository.update as jest.Mock)
        .mock.calls[0];
      expect(id).toBe(1);
      expect(username).toBe("newusername");
      expect(password).toMatch(/^\$2a\$/);
    });

    it("should update user without changing password", async () => {
      await userService.updateUser(1, "newusername");

      expect(mockUserRepository.update).toHaveBeenCalledWith(1, "newusername");
    });
  });

  describe("assignRoleToUser", () => {
    it("should assign a role to a user", async () => {
      await userService.assignRoleToUser(1, 2);

      expect(mockUserRepository.assignRole).toHaveBeenCalledWith(1, 2);
    });
  });

  describe("removeRoleFromUser", () => {
    it("should remove role from a user", async () => {
      await userService.removeRoleFromUser(1);

      expect(mockUserRepository.removeRole).toHaveBeenCalledWith(1);
    });
  });

  describe("deleteUser", () => {
    it("should delete a user", async () => {
      await userService.deleteUser(1);

      expect(mockUserRepository.delete).toHaveBeenCalledWith(1);
    });
  });
});
