import { Test, TestingModule } from '@nestjs/testing';
import { MealPlansService } from './meal-plans.service';
import { DatabaseService } from '../database/database.service';
import { NotFoundException } from '@nestjs/common';

describe('MealPlansService', () => {
  let service: MealPlansService;

  const mockDb = {
    mealPlan: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      upsert: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MealPlansService,
        { provide: DatabaseService, useValue: mockDb },
      ],
    }).compile();

    service = module.get<MealPlansService>(MealPlansService);
    jest.clearAllMocks();
  });

  describe('getByDateRange', () => {
    it('returns meal plans within a date range', async () => {
      const plans = [
        { id: '1', date: new Date('2024-01-15'), mealType: 'breakfast', description: 'Pancakes' },
        { id: '2', date: new Date('2024-01-15'), mealType: 'lunch', description: 'Salad' },
      ];
      mockDb.mealPlan.findMany.mockResolvedValue(plans);

      const result = await service.getByDateRange('2024-01-01', '2024-01-31');

      // Start date: start of day (00:00:00.000Z)
      // End date: end of day (23:59:59.999Z) to include the full day
      expect(mockDb.mealPlan.findMany).toHaveBeenCalledWith({
        where: {
          date: {
            gte: new Date('2024-01-01T00:00:00.000Z'),
            lte: new Date('2024-01-31T23:59:59.999Z'),
          },
        },
        orderBy: [{ date: 'asc' }, { mealType: 'asc' }],
      });
      expect(result).toEqual(plans);
    });
  });

  describe('getByDate', () => {
    it('returns meal plans for a specific date', async () => {
      const plans = [
        { id: '1', date: new Date('2024-01-15'), mealType: 'breakfast', description: 'Eggs' },
      ];
      mockDb.mealPlan.findMany.mockResolvedValue(plans);

      const result = await service.getByDate('2024-01-15');

      expect(result).toEqual(plans);
    });
  });

  describe('create', () => {
    it('creates a new meal plan', async () => {
      const dto = { date: '2024-01-15', mealType: 'breakfast', description: 'Waffles' };
      const created = { id: 'new-id', ...dto, date: new Date(dto.date), createdAt: new Date() };
      mockDb.mealPlan.create.mockResolvedValue(created);

      const result = await service.create(dto);

      expect(mockDb.mealPlan.create).toHaveBeenCalled();
      expect(result.description).toBe('Waffles');
    });
  });

  describe('upsert', () => {
    it('creates or updates a meal plan for a date/mealType', async () => {
      const dto = { date: '2024-01-15', mealType: 'breakfast', description: 'New menu' };
      // normalizeDate sets time to noon UTC (12:00:00) to avoid timezone issues
      const normalizedDate = new Date('2024-01-15T12:00:00.000Z');
      const upserted = { id: 'upsert-id', ...dto, date: normalizedDate };
      mockDb.mealPlan.upsert.mockResolvedValue(upserted);

      const result = await service.upsert(dto);

      expect(mockDb.mealPlan.upsert).toHaveBeenCalledWith({
        where: { date_mealType: { date: normalizedDate, mealType: 'breakfast' } },
        update: { description: 'New menu', recipe: undefined, notes: undefined },
        create: expect.objectContaining({ mealType: 'breakfast', description: 'New menu', date: normalizedDate }),
      });
      expect(result.description).toBe('New menu');
    });
  });

  describe('delete', () => {
    it('deletes a meal plan by id', async () => {
      const existing = { id: '1', date: new Date(), mealType: 'lunch' };
      mockDb.mealPlan.findUnique.mockResolvedValue(existing);
      mockDb.mealPlan.delete.mockResolvedValue(existing);

      const result = await service.delete('1');

      expect(mockDb.mealPlan.delete).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(result).toEqual({ success: true });
    });

    it('throws NotFoundException for non-existent plan', async () => {
      mockDb.mealPlan.findUnique.mockResolvedValue(null);

      await expect(service.delete('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});
