import getDb from "../../db";
import { User } from "../../domain/models";

export class UserRepository {
  async findByUsername(username: string): Promise<User | undefined> {
    const db = await getDb();
    return db.get<User>("SELECT * FROM users WHERE username = ?", username);
  }

  async create(username: string, password: string): Promise<void> {
    const db = await getDb();
    await db.run(
      "INSERT INTO users (username, password) VALUES (?, ?)",
      username,
      password,
    );
  }
}
