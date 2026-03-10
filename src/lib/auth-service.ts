import bcrypt from "bcryptjs";
import { getDatabase } from "./db";

export interface User {
  id: number;
  username: string;
  email: string;
  role_id: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const rounds = 10;
  return bcrypt.hash(password, rounds);
}

/**
 * Compare a password with a hash
 */
export async function comparePassword(
  password: string,
  hash: string,
): Promise<boolean> {
  try {
    console.log(`   🔑 comparePassword called`);
    console.log(`      Password length: ${password?.length}`);
    console.log(`      Hash length: ${hash?.length}`);
    console.log(`      Hash type: ${typeof hash}`);
    console.log(`      Hash prefix: ${hash?.substring(0, 10)}`);
    
    const result = await bcrypt.compare(password, hash);
    console.log(`      Compare result: ${result}`);
    return result;
  } catch (error) {
    console.error("❌ Error comparing passwords:", error);
    if (error instanceof Error) {
      console.error(`   Error message: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Get user by username
 */
export async function getUserByUsername(
  username: string,
): Promise<User | null> {
  try {
    const db = await getDatabase();
    const result = await db.execute({
      sql: "SELECT id, username, email, role_id, is_active, created_at, updated_at FROM users WHERE username = ?",
      args: [username],
    });

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      id: row.id as number,
      username: row.username as string,
      email: row.email as string,
      role_id: row.role_id as number,
      is_active: (row.is_active as number) === 1,
      created_at: row.created_at as string,
      updated_at: row.updated_at as string,
    };
  } catch (error) {
    console.error("Error getting user by username:", error);
    throw error;
  }
}

/**
 * Get user by ID
 */
export async function getUserById(id: number): Promise<User | null> {
  try {
    const db = await getDatabase();
    const result = await db.execute({
      sql: "SELECT id, username, email, role_id, is_active, created_at, updated_at FROM users WHERE id = ?",
      args: [id],
    });

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      id: row.id as number,
      username: row.username as string,
      email: row.email as string,
      role_id: row.role_id as number,
      is_active: (row.is_active as number) === 1,
      created_at: row.created_at as string,
      updated_at: row.updated_at as string,
    };
  } catch (error) {
    console.error("Error getting user by ID:", error);
    throw error;
  }
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const db = await getDatabase();
    const result = await db.execute({
      sql: "SELECT id, username, email, role_id, is_active, created_at, updated_at FROM users WHERE email = ?",
      args: [email],
    });

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      id: row.id as number,
      username: row.username as string,
      email: row.email as string,
      role_id: row.role_id as number,
      is_active: (row.is_active as number) === 1,
      created_at: row.created_at as string,
      updated_at: row.updated_at as string,
    };
  } catch (error) {
    console.error("Error getting user by email:", error);
    throw error;
  }
}

/**
 * Verify login credentials
 * Returns user if credentials are valid, null otherwise
 */
export async function verifyCredentials(
  username: string,
  password: string,
): Promise<User | null> {
  try {
    console.log(`🔐 verifyCredentials - Checking username: ${username}`);
    const db = await getDatabase();
    console.log(`✅ Database connection established`);

    // Get user with password hash
    const result = await db.execute({
      sql: "SELECT id, username, email, password_hash, role_id, is_active, created_at, updated_at FROM users WHERE username = ? AND is_active = 1",
      args: [username],
    });

    console.log(`📊 Query result rows: ${result.rows.length}`);

    if (result.rows.length === 0) {
      console.log(`❌ User not found or inactive: ${username}`);
      return null;
    }

    const row = result.rows[0];
    const passwordHash = row.password_hash as string;
    console.log(`✅ User found: ${username}`);
    console.log(`   Password hash exists: ${!!passwordHash}`);
    console.log(`   Hash length: ${passwordHash?.length}`);
    console.log(`   Hash preview: ${passwordHash?.substring(0, 20)}...`);

    // Verify password
    console.log(`🔑 Comparing passwords...`);
    const isPasswordValid = await comparePassword(password, passwordHash);
    console.log(`   Comparison result: ${isPasswordValid ? "✅ VALID" : "❌ INVALID"}`);

    if (!isPasswordValid) {
      console.log(`❌ Invalid password for user: ${username}`);
      return null;
    }

    // Password is valid, return user data
    const user: User = {
      id: row.id as number,
      username: row.username as string,
      email: row.email as string,
      role_id: row.role_id as number,
      is_active: (row.is_active as number) === 1,
      created_at: row.created_at as string,
      updated_at: row.updated_at as string,
    };
    
    console.log(`✅ Authentication successful for: ${username}`);
    return user;
  } catch (error) {
    console.error("❌ Error verifying credentials:", error);
    if (error instanceof Error) {
      console.error(`   Error message: ${error.message}`);
      console.error(`   Error stack: ${error.stack}`);
    }
    throw error;
  }
}

/**
 * Create a new user
 */
export async function createUser(
  username: string,
  email: string,
  password: string,
  roleId: number = 2, // Default to editor role
): Promise<User> {
  try {
    if (!username || !email || !password) {
      throw new Error("Username, email, and password are required");
    }

    // Check if user already exists
    const existingUsername = await getUserByUsername(username);
    if (existingUsername) {
      throw new Error("Username already exists");
    }

    const existingEmail = await getUserByEmail(email);
    if (existingEmail) {
      throw new Error("Email already exists");
    }

    const db = await getDatabase();
    const passwordHash = await hashPassword(password);

    const result = await db.execute({
      sql: `INSERT INTO users (username, email, password_hash, role_id, is_active) 
            VALUES (?, ?, ?, ?, 1)`,
      args: [username, email, passwordHash, roleId],
    });

    const userId = parseInt(result.lastInsertRowid?.toString(10) || "0", 10);

    // Return created user
    const user = await getUserById(userId);
    if (!user) {
      throw new Error("Failed to retrieve created user");
    }

    console.log(`✅ User created: ${username} (ID: ${userId})`);
    return user;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

/**
 * Update user password
 */
export async function updateUserPassword(
  userId: number,
  newPassword: string,
): Promise<void> {
  try {
    const db = await getDatabase();
    const passwordHash = await hashPassword(newPassword);

    await db.execute({
      sql: "UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      args: [passwordHash, userId],
    });

    console.log(`✅ Password updated for user ID: ${userId}`);
  } catch (error) {
    console.error("Error updating password:", error);
    throw error;
  }
}

/**
 * Deactivate user
 */
export async function deactivateUser(userId: number): Promise<void> {
  try {
    const db = await getDatabase();

    await db.execute({
      sql: "UPDATE users SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      args: [userId],
    });

    console.log(`✅ User deactivated: ID ${userId}`);
  } catch (error) {
    console.error("Error deactivating user:", error);
    throw error;
  }
}
