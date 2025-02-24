"use server";

import type {
  User,
  CreateUserInput,
  UpdateUserInput,
} from "@/lib/core/domain/user";
import { getSessionService, getUserService } from "@/lib/di/container";

export async function getUserById(id: number): Promise<User | null> {
  const userService = getUserService();
  return await userService.findById(id);
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const userService = getUserService();
  return await userService.findByEmail(email);
}

export async function createUser(data: CreateUserInput): Promise<User> {
  const userService = getUserService();
  return await userService.create(data);
}

export async function updateUser(
  id: number,
  data: UpdateUserInput
): Promise<User | null> {
  const userService = getUserService();
  return await userService.update(id, data);
}

export async function deleteUser(id: number): Promise<boolean> {
  const userService = getUserService();
  return await userService.delete(id);
}

export async function validateUserPassword(
  email: string,
  password: string
): Promise<User | null> {
  const userService = getUserService();
  return await userService.validatePassword(email, password);
}

export async function getCurrentUser(): Promise<User | null> {
  const sessionService = getSessionService();
  const session = await sessionService.get();
  if (!session) return null;

  const userService = getUserService();
  return await userService.findById(session.userId);
}
