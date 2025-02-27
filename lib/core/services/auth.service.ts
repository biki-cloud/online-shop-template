import { injectable, inject } from "tsyringe";
import type { IAuthService } from "./interfaces/auth.service";
import type { IUserRepository } from "../repositories/interfaces/user.repository";
import type { User, CreateUserInput } from "@/lib/core/domain/user";
import { UserValidation } from "@/lib/core/domain/user";
import { hash, compare } from "bcryptjs";
import type { ISessionService } from "./interfaces/session.service";

@injectable()
export class AuthService implements IAuthService {
  private readonly SALT_ROUNDS = 12;

  constructor(
    @inject("UserRepository")
    private readonly userRepository: IUserRepository,
    @inject("SessionService")
    private readonly sessionService: ISessionService
  ) {}

  async signIn(email: string, password: string): Promise<User> {
    if (!UserValidation.validateEmail(email)) {
      throw new Error("Invalid email format");
    }

    const user = await this.userRepository.findByEmail(email);
    if (!user || !user.passwordHash) {
      throw new Error("Invalid credentials");
    }

    const isValid = await this.comparePasswords(password, user.passwordHash);
    if (!isValid) {
      throw new Error("Invalid credentials");
    }

    await this.sessionService.set(user);
    return user;
  }

  async signUp(email: string, password: string, name: string): Promise<User> {
    // ドメインのバリデーションルールを適用
    if (!UserValidation.validateEmail(email)) {
      throw new Error("Invalid email format");
    }
    if (!UserValidation.validatePassword(password)) {
      throw new Error("Password does not meet security requirements");
    }
    if (!UserValidation.validateName(name)) {
      throw new Error("Invalid name format");
    }

    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error("User already exists");
    }

    const hashedPassword = await this.hashPassword(password);
    const userInput: CreateUserInput = {
      email,
      passwordHash: hashedPassword,
      name,
      role: "user",
    };

    const user = await this.userRepository.create(userInput);
    await this.sessionService.set(user as User);
    return user as User;
  }

  async signOut(): Promise<void> {
    await this.sessionService.clear();
  }

  async validateSession(): Promise<User | null> {
    const session = await this.sessionService.get();
    if (!session) return null;

    const user = await this.userRepository.findById(session.userId);
    return user as User | null;
  }

  async refreshSession(): Promise<void> {
    await this.sessionService.refresh();
  }

  async updatePassword(
    userId: number,
    oldPassword: string,
    newPassword: string
  ): Promise<void> {
    if (!UserValidation.validatePassword(newPassword)) {
      throw new Error("New password does not meet security requirements");
    }

    const user = await this.userRepository.findById(userId);
    if (!user || !user.passwordHash) {
      throw new Error("User not found");
    }

    const isValid = await this.comparePasswords(oldPassword, user.passwordHash);
    if (!isValid) {
      throw new Error("Invalid password");
    }

    const hashedPassword = await this.hashPassword(newPassword);
    await this.userRepository.update(userId, { passwordHash: hashedPassword });
  }

  async getSessionUser(): Promise<User | null> {
    return this.validateSession();
  }

  async verifyToken(token: string): Promise<boolean> {
    try {
      const session = await this.sessionService.get();
      return !!session;
    } catch {
      return false;
    }
  }

  async generateToken(user: User): Promise<string> {
    // このメソッドは現在のセッション実装では不要ですが、
    // インターフェースの要件を満たすために実装しています
    throw new Error("Method not implemented - use session service instead");
  }

  async hashPassword(password: string): Promise<string> {
    return await hash(password, this.SALT_ROUNDS);
  }

  async comparePasswords(
    plainText: string,
    hashedPassword: string
  ): Promise<boolean> {
    return await compare(plainText, hashedPassword);
  }
}
