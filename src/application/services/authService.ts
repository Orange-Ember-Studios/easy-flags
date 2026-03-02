import bcrypt from "bcryptjs";
import { User } from "../../domain/models";
import { UserRepository } from "../../infrastructure/repositories/userRepository";

export class AuthService {
  constructor(private readonly userRepository: UserRepository) {}

  async ensureAdminUser(adminUser: string, adminPass: string): Promise<void> {
    const existing = await this.userRepository.findByUsername(adminUser);
    if (existing) return;

    const hash = bcrypt.hashSync(adminPass, 10);
    await this.userRepository.create(adminUser, hash);
    console.log("Created admin user:", adminUser);
  }

  async authenticate(username: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findByUsername(username);
    if (!user) return null;

    const ok = bcrypt.compareSync(password, user.password);
    if (!ok) return null;

    return user;
  }
}
