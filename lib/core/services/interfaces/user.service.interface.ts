import {
  User,
  CreateUserInput,
  UpdateUserInput,
} from "@/lib/core/domain/user.domain";

export interface IUserService {
  findById(id: number): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(data: CreateUserInput): Promise<User>;
  update(id: number, data: UpdateUserInput): Promise<User | null>;
  delete(id: number): Promise<boolean>;
  validatePassword(email: string, password: string): Promise<User | null>;
}
