import { Test, TestingModule } from '@nestjs/testing';
import { AppConfigService } from './config.service';
import { DatabaseService } from '../database/database.service';
import { NotFoundException } from '@nestjs/common';

describe('AppConfigService', () => {
  let service: AppConfigService;

  const mockDb = {
    appConfig: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppConfigService,
        { provide: DatabaseService, useValue: mockDb },
      ],
    }).compile();

    service = module.get<AppConfigService>(AppConfigService);
    jest.clearAllMocks();
  });

  describe('getByType', () => {
    it('returns all config items of a specific type', async () => {
      const taskCategories = [
        { id: '1', type: 'task_category', value: 'cleaning', label: 'Cleaning', sortOrder: 0 },
        { id: '2', type: 'task_category', value: 'cooking', label: 'Cooking', sortOrder: 1 },
      ];
      mockDb.appConfig.findMany.mockResolvedValue(taskCategories);

      const result = await service.getByType('task_category');

      expect(mockDb.appConfig.findMany).toHaveBeenCalledWith({
        where: { type: 'task_category' },
        orderBy: { sortOrder: 'asc' },
      });
      expect(result).toEqual(taskCategories);
    });

    it('returns empty array when no items exist for type', async () => {
      mockDb.appConfig.findMany.mockResolvedValue([]);

      const result = await service.getByType('nonexistent_type');

      expect(result).toEqual([]);
    });
  });

  describe('create', () => {
    it('creates a new config item', async () => {
      const dto = { type: 'task_category', value: 'errands', label: 'Errands' };
      const created = { id: 'new-id', ...dto, sortOrder: 0, createdAt: new Date() };
      mockDb.appConfig.findFirst.mockResolvedValue(null);
      mockDb.appConfig.create.mockResolvedValue(created);

      const result = await service.create(dto);

      expect(mockDb.appConfig.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ type: 'task_category', value: 'errands', label: 'Errands' }),
      });
      expect(result.value).toBe('errands');
    });

    it('rejects duplicate value within same type', async () => {
      const dto = { type: 'task_category', value: 'cleaning', label: 'Cleaning' };
      mockDb.appConfig.findFirst.mockResolvedValue({ id: 'existing', ...dto });

      await expect(service.create(dto)).rejects.toThrow('Config value already exists for this type');
    });
  });

  describe('update', () => {
    it('updates an existing config item', async () => {
      const existing = { id: '1', type: 'task_category', value: 'cleaning', label: 'Cleaning', sortOrder: 0 };
      const updated = { ...existing, label: 'Deep Cleaning' };
      mockDb.appConfig.findUnique.mockResolvedValue(existing);
      mockDb.appConfig.update.mockResolvedValue(updated);

      const result = await service.update('1', { label: 'Deep Cleaning' });

      expect(mockDb.appConfig.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { label: 'Deep Cleaning' },
      });
      expect(result.label).toBe('Deep Cleaning');
    });

    it('throws NotFoundException for non-existent item', async () => {
      mockDb.appConfig.findUnique.mockResolvedValue(null);

      await expect(service.update('nonexistent', { label: 'Test' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('deletes an existing config item', async () => {
      const existing = { id: '1', type: 'task_category', value: 'cleaning', label: 'Cleaning' };
      mockDb.appConfig.findUnique.mockResolvedValue(existing);
      mockDb.appConfig.delete.mockResolvedValue(existing);

      const result = await service.delete('1');

      expect(mockDb.appConfig.delete).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(result).toEqual({ success: true });
    });

    it('throws NotFoundException for non-existent item', async () => {
      mockDb.appConfig.findUnique.mockResolvedValue(null);

      await expect(service.delete('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getConfigTypes', () => {
    it('returns all available config types', () => {
      const types = service.getConfigTypes();

      expect(types).toContain('task_category');
      expect(types).toContain('inventory_category');
      expect(types).toContain('unit');
      expect(types).toContain('activity_type');
      expect(types).toContain('meal_type');
      expect(types).toContain('shopping_list_type');
    });
  });
});
