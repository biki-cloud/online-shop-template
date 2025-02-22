import { describe, expect, it, jest, beforeEach } from "@jest/globals";
import { eq } from "drizzle-orm";
import { PgTable, TableConfig, PgColumn } from "drizzle-orm/pg-core";
import { BaseRepository } from "../base.repository";
import { Database } from "@/lib/infrastructure/db/drizzle";

// テスト用のモックデータ型
interface TestEntity {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

// テスト用のモックリポジトリ
class TestRepository extends BaseRepository<TestEntity> {
  protected get idColumn(): PgColumn<any> {
    return { name: "id" } as PgColumn<any>;
  }
}

describe("BaseRepository", () => {
  let repository: TestRepository;
  let mockDb: jest.Mocked<Database>;
  let mockTable: jest.Mocked<PgTable<TableConfig>>;
  let mockExecute: jest.Mock;
  let mockSelect: jest.Mock;
  let mockWhere: jest.Mock;
  let mockLimit: jest.Mock;
  let mockInsert: jest.Mock;
  let mockValues: jest.Mock;
  let mockUpdate: jest.Mock;
  let mockSet: jest.Mock;
  let mockDelete: jest.Mock;
  let mockReturning: jest.Mock;

  beforeEach(() => {
    // モックの設定
    mockExecute = jest.fn();
    mockSelect = jest.fn();
    mockWhere = jest.fn();
    mockLimit = jest.fn();
    mockInsert = jest.fn();
    mockValues = jest.fn();
    mockUpdate = jest.fn();
    mockSet = jest.fn();
    mockDelete = jest.fn();
    mockReturning = jest.fn();

    // モックチェーンの設定
    mockSelect.mockReturnThis();
    mockWhere.mockReturnThis();
    mockLimit.mockReturnThis();
    mockInsert.mockReturnThis();
    mockValues.mockReturnThis();
    mockUpdate.mockReturnThis();
    mockSet.mockReturnThis();
    mockDelete.mockReturnThis();
    mockReturning.mockReturnThis();

    mockDb = {
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete,
    } as any;

    mockTable = {} as any;

    repository = new TestRepository(mockDb, mockTable);
  });

  describe("findById", () => {
    it("should return entity when found", async () => {
      const mockEntity: TestEntity = {
        id: 1,
        name: "Test",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockExecute.mockResolvedValueOnce([mockEntity]);

      mockSelect.mockImplementation(() => ({
        from: () => ({
          where: mockWhere.mockImplementation(() => ({
            limit: mockLimit.mockImplementation(() => ({
              execute: mockExecute,
            })),
          })),
        }),
      }));

      const result = await repository.findById(1);

      expect(result).toEqual(mockEntity);
      expect(mockSelect).toHaveBeenCalled();
      expect(mockWhere).toHaveBeenCalled();
      expect(mockLimit).toHaveBeenCalledWith(1);
      expect(mockExecute).toHaveBeenCalled();
    });

    it("should return null when not found", async () => {
      mockExecute.mockResolvedValueOnce([]);

      mockSelect.mockImplementation(() => ({
        from: () => ({
          where: mockWhere.mockImplementation(() => ({
            limit: mockLimit.mockImplementation(() => ({
              execute: mockExecute,
            })),
          })),
        }),
      }));

      const result = await repository.findById(1);

      expect(result).toBeNull();
    });
  });

  describe("findAll", () => {
    it("should return all entities", async () => {
      const mockEntities: TestEntity[] = [
        {
          id: 1,
          name: "Test 1",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          name: "Test 2",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockExecute.mockResolvedValueOnce(mockEntities);

      mockSelect.mockImplementation(() => ({
        from: () => ({
          execute: mockExecute,
        }),
      }));

      const result = await repository.findAll();

      expect(result).toEqual(mockEntities);
      expect(mockSelect).toHaveBeenCalled();
      expect(mockExecute).toHaveBeenCalled();
    });
  });

  describe("create", () => {
    it("should create and return new entity", async () => {
      const mockEntity: TestEntity = {
        id: 1,
        name: "Test",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockExecute.mockResolvedValueOnce([mockEntity]);

      mockInsert.mockImplementation(() => ({
        values: mockValues.mockImplementation(() => ({
          returning: mockReturning.mockImplementation(() => ({
            execute: mockExecute,
          })),
        })),
      }));

      const result = await repository.create({ name: "Test" });

      expect(result).toEqual(mockEntity);
      expect(mockInsert).toHaveBeenCalled();
      expect(mockValues).toHaveBeenCalled();
      expect(mockReturning).toHaveBeenCalled();
      expect(mockExecute).toHaveBeenCalled();
    });
  });

  describe("update", () => {
    it("should update and return updated entity", async () => {
      const mockEntity: TestEntity = {
        id: 1,
        name: "Updated Test",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockExecute.mockResolvedValueOnce([mockEntity]);

      mockUpdate.mockImplementation(() => ({
        set: mockSet.mockImplementation(() => ({
          where: mockWhere.mockImplementation(() => ({
            returning: mockReturning.mockImplementation(() => ({
              execute: mockExecute,
            })),
          })),
        })),
      }));

      const result = await repository.update(1, { name: "Updated Test" });

      expect(result).toEqual(mockEntity);
      expect(mockUpdate).toHaveBeenCalled();
      expect(mockSet).toHaveBeenCalled();
      expect(mockWhere).toHaveBeenCalled();
      expect(mockReturning).toHaveBeenCalled();
      expect(mockExecute).toHaveBeenCalled();
    });

    it("should return null when entity not found", async () => {
      mockExecute.mockResolvedValueOnce([]);

      mockUpdate.mockImplementation(() => ({
        set: mockSet.mockImplementation(() => ({
          where: mockWhere.mockImplementation(() => ({
            returning: mockReturning.mockImplementation(() => ({
              execute: mockExecute,
            })),
          })),
        })),
      }));

      const result = await repository.update(1, { name: "Updated Test" });

      expect(result).toBeNull();
    });
  });

  describe("delete", () => {
    it("should return true when entity is deleted", async () => {
      mockExecute.mockResolvedValueOnce([{ id: 1 }]);

      mockDelete.mockImplementation(() => ({
        where: mockWhere.mockImplementation(() => ({
          returning: mockReturning.mockImplementation(() => ({
            execute: mockExecute,
          })),
        })),
      }));

      const result = await repository.delete(1);

      expect(result).toBe(true);
      expect(mockDelete).toHaveBeenCalled();
      expect(mockWhere).toHaveBeenCalled();
      expect(mockReturning).toHaveBeenCalled();
      expect(mockExecute).toHaveBeenCalled();
    });

    it("should return false when entity not found", async () => {
      mockExecute.mockResolvedValueOnce([]);

      mockDelete.mockImplementation(() => ({
        where: mockWhere.mockImplementation(() => ({
          returning: mockReturning.mockImplementation(() => ({
            execute: mockExecute,
          })),
        })),
      }));

      const result = await repository.delete(1);

      expect(result).toBe(false);
    });
  });
});
