// drizzleのモック
export const db = {
  query: jest.fn(),
  insert: jest.fn(),
  select: jest.fn().mockReturnValue({
    from: jest.fn().mockReturnValue({
      where: jest.fn().mockReturnValue({
        execute: jest.fn().mockResolvedValue([]),
      }),
      execute: jest.fn().mockResolvedValue([]),
    }),
  }),
  update: jest.fn().mockReturnValue({
    set: jest.fn().mockReturnValue({
      where: jest.fn().mockReturnValue({
        execute: jest.fn().mockResolvedValue([]),
      }),
    }),
  }),
  delete: jest.fn().mockReturnValue({
    from: jest.fn().mockReturnValue({
      where: jest.fn().mockReturnValue({
        execute: jest.fn().mockResolvedValue([]),
      }),
      execute: jest.fn().mockResolvedValue([]),
    }),
  }),
  transaction: jest.fn().mockImplementation(async (callback) => {
    return await callback(db);
  }),
};

export type Database = typeof db;
