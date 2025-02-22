export interface User {
  id: number;
  name: string | null;
  email: string;
  passwordHash: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export type CreateUserInput = {
  name: string;
  email: string;
  password: string;
  role?: string;
};

export type UpdateUserInput = Partial<{
  name: string;
  email: string;
  password: string;
  role: string;
}>;
