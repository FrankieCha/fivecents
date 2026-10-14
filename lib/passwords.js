import argon2 from "argon2";
import crypto from "node:crypto";

export function createTemporaryPassword() {
  return crypto.randomBytes(12).toString("base64url");
}

export async function hashPassword(password) {
  return argon2.hash(password, { type: argon2.argon2id });
}

export async function verifyPassword(hash, password) {
  return argon2.verify(hash, password);
}

export function createResetToken() {
  const token = crypto.randomBytes(32).toString("base64url");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  return { token, tokenHash };
}
