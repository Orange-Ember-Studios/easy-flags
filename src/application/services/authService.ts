import bcrypt from "bcryptjs";
import { User } from "../../domain/models";
import { UserRepository } from "../../infrastructure/repositories/userRepository";

export class AuthService {
  constructor(private readonly userRepository: UserRepository) {}

  async ensureAdminUser(adminUser: string, adminPass: string): Promise<void> {
    const existing = await this.userRepository.findByUsername(adminUser);

    // If admin user doesn't exist, create it
    if (!existing) {
      const hash = bcrypt.hashSync(adminPass, 10);
      await this.userRepository.create(adminUser, hash);
      console.log("Created admin user:", adminUser);
      return;
    }

    // If admin user exists but has placeholder password, update it
    const isPlaceholder =
      existing.password === "$2a$10$DEFAULT_ADMIN_PLACEHOLDER";
    if (isPlaceholder) {
      const hash = bcrypt.hashSync(adminPass, 10);
      await this.userRepository.update(existing.id, adminUser, hash);
      console.log("Updated admin user password:", adminUser);
    }
  }

  async authenticate(username: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findByUsername(username);
    if (!user) return null;

    const ok = bcrypt.compareSync(password, user.password);
    if (!ok) return null;

    return user;
  }
}
