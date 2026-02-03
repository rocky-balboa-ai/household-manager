import { Test, TestingModule } from '@nestjs/testing';
import { ShoppingService } from './shopping.service';
import { DatabaseService } from '../database/database.service';
import { NotFoundException } from '@nestjs/common';

describe('ShoppingService', () => {
  let service: ShoppingService;

  const mockDb = {
    shoppingList: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    shoppingItem: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShoppingService,
        { provide: DatabaseService, useValue: mockDb },
      ],
    }).compile();

    service = module.get<ShoppingService>(ShoppingService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('returns all shopping lists', async () => {
      const lists = [
        { id: '1', type: 'weekly', items: [] },
        { id: '2', type: 'costco', items: [] },
      ];
      mockDb.shoppingList.findMany.mockResolvedValue(lists);

      const result = await service.findAll();

      expect(mockDb.shoppingList.findMany).toHaveBeenCalledWith({
        where: {},
        include: { items: true },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(lists);
    });

    it('filters by type when provided', async () => {
      mockDb.shoppingList.findMany.mockResolvedValue([]);

      await service.findAll('weekly');

      expect(mockDb.shoppingList.findMany).toHaveBeenCalledWith({
        where: { type: 'weekly' },
        include: { items: true },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    it('returns a shopping list by id', async () => {
      const list = { id: '1', type: 'weekly', items: [{ id: 'item1', name: 'Milk' }] };
      mockDb.shoppingList.findUnique.mockResolvedValue(list);

      const result = await service.findOne('1');

      expect(mockDb.shoppingList.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: { items: true },
      });
      expect(result).toEqual(list);
    });

    it('throws NotFoundException when list not found', async () => {
      mockDb.shoppingList.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('creates a new shopping list', async () => {
      const dto = { name: 'Weekly Groceries', type: 'weekly' };
      const created = { id: 'new-id', ...dto, items: [] };
      mockDb.shoppingList.create.mockResolvedValue(created);

      const result = await service.create(dto);

      expect(mockDb.shoppingList.create).toHaveBeenCalledWith({
        data: dto,
        include: { items: true },
      });
      expect(result).toEqual(created);
    });
  });

  describe('addItem', () => {
    it('adds an item to a shopping list', async () => {
      const list = { id: '1', type: 'weekly', items: [] };
      mockDb.shoppingList.findUnique.mockResolvedValue(list);
      const dto = { name: 'Milk', quantity: 2 };
      const item = { id: 'item1', listId: '1', ...dto };
      mockDb.shoppingItem.create.mockResolvedValue(item);

      const result = await service.addItem('1', dto);

      expect(mockDb.shoppingItem.create).toHaveBeenCalledWith({
        data: { listId: '1', name: 'Milk', quantity: 2 },
      });
      expect(result).toEqual(item);
    });

    it('defaults quantity to 1 when not provided', async () => {
      const list = { id: '1', type: 'weekly', items: [] };
      mockDb.shoppingList.findUnique.mockResolvedValue(list);
      const dto = { name: 'Bread' };
      mockDb.shoppingItem.create.mockResolvedValue({ id: 'item1', ...dto, quantity: 1 });

      await service.addItem('1', dto);

      expect(mockDb.shoppingItem.create).toHaveBeenCalledWith({
        data: { listId: '1', name: 'Bread', quantity: 1 },
      });
    });

    it('throws NotFoundException when list not found', async () => {
      mockDb.shoppingList.findUnique.mockResolvedValue(null);

      await expect(service.addItem('nonexistent', { name: 'Milk' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateItem', () => {
    it('updates an item in a shopping list', async () => {
      const list = { id: '1', type: 'weekly', items: [] };
      mockDb.shoppingList.findUnique.mockResolvedValue(list);
      const item = { id: 'item1', listId: '1', name: 'Milk', purchased: false };
      mockDb.shoppingItem.findUnique.mockResolvedValue(item);
      const dto = { purchased: true };
      const updated = { ...item, purchased: true };
      mockDb.shoppingItem.update.mockResolvedValue(updated);

      const result = await service.updateItem('1', 'item1', dto);

      expect(mockDb.shoppingItem.update).toHaveBeenCalledWith({
        where: { id: 'item1' },
        data: dto,
      });
      expect(result).toEqual(updated);
    });

    it('throws NotFoundException when item not found', async () => {
      const list = { id: '1', type: 'weekly', items: [] };
      mockDb.shoppingList.findUnique.mockResolvedValue(list);
      mockDb.shoppingItem.findUnique.mockResolvedValue(null);

      await expect(service.updateItem('1', 'nonexistent', { purchased: true })).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException when item belongs to different list', async () => {
      const list = { id: '1', type: 'weekly', items: [] };
      mockDb.shoppingList.findUnique.mockResolvedValue(list);
      const item = { id: 'item1', listId: '2', name: 'Milk' }; // different list
      mockDb.shoppingItem.findUnique.mockResolvedValue(item);

      await expect(service.updateItem('1', 'item1', { purchased: true })).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteItem', () => {
    it('deletes an item from a shopping list', async () => {
      const list = { id: '1', type: 'weekly', items: [] };
      mockDb.shoppingList.findUnique.mockResolvedValue(list);
      mockDb.shoppingItem.delete.mockResolvedValue({});

      const result = await service.deleteItem('1', 'item1');

      expect(mockDb.shoppingItem.delete).toHaveBeenCalledWith({ where: { id: 'item1' } });
      expect(result).toEqual({ success: true });
    });
  });

  describe('complete', () => {
    it('marks a shopping list as completed', async () => {
      const list = { id: '1', type: 'weekly', status: 'active' };
      mockDb.shoppingList.findUnique.mockResolvedValue(list);
      const completed = { ...list, status: 'completed', completedAt: expect.any(Date) };
      mockDb.shoppingList.update.mockResolvedValue(completed);

      const result = await service.complete('1');

      expect(mockDb.shoppingList.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { status: 'completed', completedAt: expect.any(Date) },
        include: { items: true },
      });
      expect(result.status).toBe('completed');
    });
  });

  describe('delete', () => {
    it('deletes a shopping list', async () => {
      const list = { id: '1', type: 'weekly' };
      mockDb.shoppingList.findUnique.mockResolvedValue(list);
      mockDb.shoppingList.delete.mockResolvedValue({});

      const result = await service.delete('1');

      expect(mockDb.shoppingList.delete).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(result).toEqual({ success: true });
    });

    it('throws NotFoundException when list not found', async () => {
      mockDb.shoppingList.findUnique.mockResolvedValue(null);

      await expect(service.delete('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});
