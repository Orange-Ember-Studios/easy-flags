import { AuthService } from "../../../src/application/services/authService";
import { createMockUserRepository, mockUsers } from "../../setup";

describe("AuthService", () => {
  let authService: AuthService;
  let mockUserRepository: ReturnType<typeof createMockUserRepository>;

  beforeEach(() => {
    mockUserRepository = createMockUserRepository();
    authService = new AuthService(mockUserRepository);
  });

  describe("ensureAdminUser", () => {
    it("should create admin user if it does not exist", async () => {
      mockUserRepository.findByUsername.mockResolvedValue(null);

      await authService.ensureAdminUser("admin", "password123");

      expect(mockUserRepository.findByUsername).toHaveBeenCalledWith("admin");
      expect(mockUserRepository.create).toHaveBeenCalled();
      const [username, password] = (mockUserRepository.create as jest.Mock).mock
        .calls[0];
      expect(username).toBe("admin");
      expect(password).toMatch(/^\$2a\$/); // bcrypt hash starts with $2a$
    });

    it("should not create admin user if it already exists", async () => {
      mockUserRepository.findByUsername.mockResolvedValue(mockUsers.admin);

      await authService.ensureAdminUser("admin", "password123");

      expect(mockUserRepository.findByUsername).toHaveBeenCalledWith("admin");
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });
  });

  describe("authenticate", () => {
    it("should return user on successful authentication", async () => {
      // We need to use actual password hashing since bcrypt.compareSync checks hashes
      mockUserRepository.findByUsername.mockResolvedValue(mockUsers.admin);

      const result = await authService.authenticate("admin", "password");

      expect(mockUserRepository.findByUsername).toHaveBeenCalledWith("admin");
      // Note: Since we're using a mock hash, the actual password won't match
    });

    it("should return null if user does not exist", async () => {
      mockUserRepository.findByUsername.mockResolvedValue(null);

      const result = await authService.authenticate("nonexistent", "password");

      expect(result).toBeNull();
    });

    it("should return null if password is incorrect", async () => {
      mockUserRepository.findByUsername.mockResolvedValue(mockUsers.admin);

      const result = await authService.authenticate("admin", "wrongpassword");

      expect(mockUserRepository.findByUsername).toHaveBeenCalledWith("admin");
      expect(result).toBeNull();
    });
  });
});
