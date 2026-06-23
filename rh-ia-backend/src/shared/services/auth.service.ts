import bcrypt from "bcryptjs";
import jwt, { type JwtPayload, type SignOptions } from "jsonwebtoken";
import type { UserRole } from "@prisma/client";
import { env } from "@/config/env";

const SALT_ROUNDS = 10;
const TOKEN_EXPIRES_IN: SignOptions["expiresIn"] = "8h";

export interface AuthTokenPayload extends JwtPayload {
  userId: string;
  tenantId: string;
  role: UserRole;
}

export async function hashPassword(plainPassword: string): Promise<string> {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

export async function comparePassword(plainPassword: string, passwordHash: string): Promise<boolean> {
  return bcrypt.compare(plainPassword, passwordHash);
}

export function generateToken(payload: { userId: string; tenantId: string; role: UserRole }): string {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: TOKEN_EXPIRES_IN });
}

/**
 * Lança se o token for inválido, expirado ou malformado — quem chama deve
 * tratar a exceção e responder 401.
 */
export function verifyToken(token: string): AuthTokenPayload {
  return jwt.verify(token, env.jwtSecret) as AuthTokenPayload;
}
