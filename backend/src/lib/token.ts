import { createHash, randomUUID } from "node:crypto";
import jwt, { type SignOptions } from "jsonwebtoken";

export type AccessTokenPayload = {
  sub: string;
  sid: string;
  role: "USER" | "ADMIN";
};

/**
 * Get the JWT access secret from environment variables.
 */
function getAccessTokenSecret(): string {
  const secret = process.env.JWT_ACCESS_SECRET;

  if (!secret) {
    throw new Error(
      "JWT_ACCESS_SECRET is missing from the environment variables."
    );
  }

  return secret;
}

/**
 * Get the JWT access-token lifetime.
 *
 * Defaults to 15 minutes if JWT_ACCESS_TTL is not provided.
 */
function getAccessTokenTTL(): SignOptions["expiresIn"] {
  return (process.env.JWT_ACCESS_TTL || "15m") as SignOptions["expiresIn"];
}

/**
 * Create a JWT access token.
 */
export function createAccessToken(
  payload: AccessTokenPayload
): string {
  return jwt.sign(payload, getAccessTokenSecret(), {
    expiresIn: getAccessTokenTTL(),
  });
}

/**
 * Verify a JWT access token.
 */
export function verifyAccessToken(
  token: string
): AccessTokenPayload {
  return jwt.verify(
    token,
    getAccessTokenSecret()
  ) as AccessTokenPayload;
}

/**
 * Generate a secure random opaque token.
 */
export function newOpaqueToken(): string {
  return randomUUID();
}

/**
 * Create a SHA-256 hash of a token.
 */
export function hashToken(token: string): string {
  return createHash("sha256")
    .update(token)
    .digest("hex");
}

