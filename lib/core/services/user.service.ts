import { compare, hash } from "bcryptjs";
import { inject, injectable } from "tsyringe";
import type {
  User,
  CreateUserInput,
  UpdateUserInput,
} from "@/lib/core/domain/user";
import type { IUserRepository } from "../repositories/interfaces/user.repository";
import type { IUserService } from "./interfaces/user.service";

@injectable()
export class UserService implements IUserService {
  constructor(
    @inject("UserRepository")
    private readonly userRepository: IUserRepository
  ) {}

  async findById(id: number): Promise<User | null> {
    return await this.userRepository.findById(id);
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findByEmail(email);
  }

  private async hashPassword(password: string): Promise<string> {
    return await hash(password, 10);
  }

  async create(data: CreateUserInput): Promise<User> {
    const existingUser = await this.findByEmail(data.email);
    if (existingUser) {
      throw new Error("このメールアドレスは既に登録されています。");
    }

    const { password, ...rest } = data;
    const passwordHash = await this.hashPassword(password);

    return await this.userRepository.create({
      ...rest,
      role: data.role ?? "user",
      passwordHash,
    });
  }

  async update(id: number, data: UpdateUserInput): Promise<User | null> {
    if (data.email) {
      const existingUser = await this.findByEmail(data.email);
      if (existingUser && existingUser.id !== id) {
        throw new Error("このメールアドレスは既に使用されています。");
      }
    }

    if (data.password) {
      const passwordHash = await this.hashPassword(data.password);
      const { password, ...rest } = data;
      return await this.userRepository.update(id, {
        ...rest,
        passwordHash,
      });
    }

    return await this.userRepository.update(id, data);
  }

  async delete(id: number): Promise<boolean> {
    return await this.userRepository.delete(id);
  }

  async validatePassword(
    email: string,
    password: string
  ): Promise<User | null> {
    const user = await this.findByEmail(email);
    if (!user) return null;

    const isValid = await compare(password, user.passwordHash);
    return isValid ? user : null;
  }
}
