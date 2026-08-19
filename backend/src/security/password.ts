import crypto from "node:crypto";

/**
 * Hashes a plaintext password using PBKDF2.
 * Returns the salt and hash concatenated with a colon (salt:hash).
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, "sha512")
    .toString("hex");
  return `${salt}:${hash}`;
}

/**
 * Verifies a plaintext password against a stored hash string.
 * Supports backward compatibility for the "dummy" password.
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  if (storedHash === "dummy" && password === "dummy") {
    return true;
  }

  const parts = storedHash.split(":");
  if (parts.length !== 2) {
    return false;
  }

  const [salt, hash] = parts;
  const verifyHash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, "sha512")
    .toString("hex");
  return hash === verifyHash;
}

/**
 * Generates a secure random session token.
 */
export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}
