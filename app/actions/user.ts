"use server";

import { hash } from "bcryptjs";
import type {
  User,
  CreateUserInput,
  UpdateUserInput,
} from "@/lib/core/domain/user";
import { getContainer } from "@/lib/di/container";
import type { IUserService } from "@/lib/core/services/interfaces/user.service";
import { getSession } from "@/lib/infrastructure/auth/session";

function getUserService() {
  const container = getContainer();
  return container.resolve<IUserService>("UserService");
}

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
  const session = await getSession();
  if (!session) return null;

  const userService = getUserService();
  return await userService.findById(session.user.id);
}
