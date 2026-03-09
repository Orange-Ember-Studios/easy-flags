import { UserRepository } from "../../../src/infrastructure/repositories/userRepository";
import { mockUsers } from "../../setup";

// Mock the database module
jest.mock("../../../src/db", () => ({
  __esModule: true,
  default: jest.fn(async () => mockDb),
}));

const mockDb = {
  get: jest.fn(),
  all: jest.fn(),
  run: jest.fn(),
  exec: jest.fn(),
};

describe("UserRepository", () => {
  let userRepository: UserRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    userRepository = new UserRepository();
  });

  describe("findByUsername", () => {
    it("should find user by username", async () => {
      mockDb.get.mockResolvedValue(mockUsers.admin);

      const result = await userRepository.findByUsername("admin");

      expect(mockDb.get).toHaveBeenCalled();
      expect(result).toEqual(mockUsers.admin);
    });

    it("should return undefined if user not found", async () => {
      mockDb.get.mockResolvedValue(undefined);

      const result = await userRepository.findByUsername("nonexistent");

      expect(result).toBeUndefined();
    });
  });

  describe("create", () => {
    it("should create a user with role", async () => {
      await userRepository.create("newuser", "hashedpass", 1);

      expect(mockDb.run).toHaveBeenCalled();
      const sql = (mockDb.run as jest.Mock).mock.calls[0][0];
      expect(sql).toContain("INSERT INTO users");
    });

    it("should create a user without role", async () => {
      await userRepository.create("newuser", "hashedpass");

      expect(mockDb.run).toHaveBeenCalled();
      const [, username, password, roleId] = (mockDb.run as jest.Mock).mock
        .calls[0];
      expect(username).toBe("newuser");
      expect(password).toBe("hashedpass");
      expect(roleId).toBeNull();
    });
  });

  describe("listAll", () => {
    it("should return all users", async () => {
      mockDb.all.mockResolvedValue([mockUsers.admin, mockUsers.editor]);

      const result = await userRepository.listAll();

      expect(mockDb.all).toHaveBeenCalled();
      expect(result).toHaveLength(2);
    });
  });

  describe("findById", () => {
    it("should find user by id", async () => {
      mockDb.get.mockResolvedValue(mockUsers.admin);

      const result = await userRepository.findById(1);

      expect(result).toEqual(mockUsers.admin);
    });
  });

  describe("update", () => {
    it("should update user with new password", async () => {
      await userRepository.update(1, "newusername", "newpassword");

      expect(mockDb.run).toHaveBeenCalled();
      const sql = (mockDb.run as jest.Mock).mock.calls[0][0];
      expect(sql).toContain("UPDATE users");
      expect(sql).toContain("password");
    });

    it("should update only username if password not provided", async () => {
      await userRepository.update(1, "newusername");

      expect(mockDb.run).toHaveBeenCalled();
      const sql = (mockDb.run as jest.Mock).mock.calls[0][0];
      expect(sql).toContain("UPDATE users");
      expect(sql).not.toContain("password");
    });
  });

  describe("assignRole", () => {
    it("should assign role to user", async () => {
      await userRepository.assignRole(1, 2);

      expect(mockDb.run).toHaveBeenCalled();
      const sql = (mockDb.run as jest.Mock).mock.calls[0][0];
      expect(sql).toContain("role_id");
    });
  });

  describe("removeRole", () => {
    it("should remove role from user", async () => {
      await userRepository.removeRole(1);

      expect(mockDb.run).toHaveBeenCalled();
      const sql = (mockDb.run as jest.Mock).mock.calls[0][0];
      expect(sql).toContain("role_id = NULL");
    });
  });

  describe("delete", () => {
    it("should delete user", async () => {
      await userRepository.delete(1);

      expect(mockDb.run).toHaveBeenCalled();
      const sql = (mockDb.run as jest.Mock).mock.calls[0][0];
      expect(sql).toContain("DELETE FROM users");
    });
  });
});
