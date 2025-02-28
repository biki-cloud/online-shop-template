import type { User } from "@/lib/core/domain/user.domain";

export interface AuthError extends Error {
  code: string;
  statusCode: number;
}

export interface IAuthService {
  signIn(email: string, password: string): Promise<User>;
  signUp(email: string, password: string, name: string): Promise<User>;
  signOut(): Promise<void>;
  validateSession(): Promise<User | null>;
  refreshSession(): Promise<void>;
  updatePassword(
    userId: number,
    oldPassword: string,
    newPassword: string
  ): Promise<void>;
  getSessionUser(): Promise<User | null>;
  verifyToken(token: string): Promise<boolean>;
  generateToken(user: User): Promise<string>;
  hashPassword(password: string): Promise<string>;
  comparePasswords(plainText: string, hashedPassword: string): Promise<boolean>;
}
