export type UserRole = "admin" | "user";

export interface User {
  id: number;
  email: string;
  name: string | null;
  role: UserRole;
  passwordHash: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export interface CreateUserInput {
  email: string;
  name: string;
  passwordHash: string;
  role?: UserRole;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  passwordHash?: string;
  role?: UserRole;
}

export class UserValidation {
  static validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  static validatePassword(password: string): boolean {
    return /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/.test(
      password
    );
  }

  static validateName(name: string): boolean {
    return name.length >= 2 && name.length <= 50;
  }
}
