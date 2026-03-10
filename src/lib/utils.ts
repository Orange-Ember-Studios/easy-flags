/**
 * Utility Functions
 */

import { createHash } from "crypto";

export function generateSecureId(): string {
  return `key_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

export function generateApiKey(): string {
  return `env_${createHash("sha256").update(Math.random().toString()).digest("hex").substring(0, 32)}`;
}

export function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

export function customDatetime(): string {
  return new Date().toISOString();
}
