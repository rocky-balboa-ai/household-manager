import { Test, TestingModule } from '@nestjs/testing';
import { InventoryService } from './inventory.service';
import { DatabaseService } from '../database/database.service';
import { WebsocketGateway } from '../websocket/websocket.gateway';
import { NotFoundException } from '@nestjs/common';

describe('InventoryService', () => {
  let service: InventoryService;

  const mockDb = {
    inventoryItem: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockWs = {
    emitInventoryUpdated: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        { provide: DatabaseService, useValue: mockDb },
        { provide: WebsocketGateway, useValue: mockWs },
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('returns all inventory items', async () => {
      const items = [
        { id: '1', name: 'Milk', category: 'dairy', quantity: 2 },
        { id: '2', name: 'Eggs', category: 'dairy', quantity: 12 },
      ];
      mockDb.inventoryItem.findMany.mockResolvedValue(items);

      const result = await service.findAll();

      expect(mockDb.inventoryItem.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: [{ category: 'asc' }, { name: 'asc' }],
      });
      expect(result).toEqual(items);
    });

    it('filters by category when provided', async () => {
      mockDb.inventoryItem.findMany.mockResolvedValue([]);

      await service.findAll('dairy');

      expect(mockDb.inventoryItem.findMany).toHaveBeenCalledWith({
        where: { category: 'dairy' },
        orderBy: [{ category: 'asc' }, { name: 'asc' }],
      });
    });
  });

  describe('findOne', () => {
    it('returns an inventory item by id', async () => {
      const item = { id: '1', name: 'Milk', quantity: 2 };
      mockDb.inventoryItem.findUnique.mockResolvedValue(item);

      const result = await service.findOne('1');

      expect(mockDb.inventoryItem.findUnique).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(result).toEqual(item);
    });

    it('throws NotFoundException when item not found', async () => {
      mockDb.inventoryItem.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('creates a new inventory item', async () => {
      const dto = { name: 'Butter', category: 'dairy', quantity: 3 };
      const created = { id: 'new-id', ...dto };
      mockDb.inventoryItem.create.mockResolvedValue(created);

      const result = await service.create(dto);

      expect(mockDb.inventoryItem.create).toHaveBeenCalledWith({ data: dto });
      expect(mockWs.emitInventoryUpdated).toHaveBeenCalledWith(created);
      expect(result).toEqual(created);
    });

    it('defaults quantity to 0 when not provided', async () => {
      const dto = { name: 'Salt', category: 'pantry' };
      const created = { id: 'new-id', ...dto, quantity: 0 };
      mockDb.inventoryItem.create.mockResolvedValue(created);

      await service.create(dto);

      expect(mockDb.inventoryItem.create).toHaveBeenCalledWith({
        data: { ...dto, quantity: 0 },
      });
    });
  });

  describe('update', () => {
    it('updates an inventory item', async () => {
      const item = { id: '1', name: 'Milk', category: 'fridge', quantity: 2 };
      mockDb.inventoryItem.findUnique.mockResolvedValue(item);
      const dto = { name: 'Milk', category: 'fridge', quantity: 5 };
      const updated = { ...item, quantity: 5 };
      mockDb.inventoryItem.update.mockResolvedValue(updated);

      const result = await service.update('1', dto);

      expect(mockDb.inventoryItem.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: dto,
      });
      expect(mockWs.emitInventoryUpdated).toHaveBeenCalledWith(updated);
      expect(result).toEqual(updated);
    });

    it('throws NotFoundException when item not found', async () => {
      mockDb.inventoryItem.findUnique.mockResolvedValue(null);

      await expect(service.update('nonexistent', { name: 'Item', category: 'pantry', quantity: 5 })).rejects.toThrow(NotFoundException);
    });
  });

  describe('adjust', () => {
    it('increases inventory quantity', async () => {
      const item = { id: '1', name: 'Milk', quantity: 2 };
      mockDb.inventoryItem.findUnique.mockResolvedValue(item);
      const adjusted = { ...item, quantity: 5 };
      mockDb.inventoryItem.update.mockResolvedValue(adjusted);

      const result = await service.adjust('1', { amount: 3 });

      expect(mockDb.inventoryItem.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { quantity: 5 },
      });
      expect(mockWs.emitInventoryUpdated).toHaveBeenCalledWith(adjusted);
      expect(result.quantity).toBe(5);
    });

    it('decreases inventory quantity', async () => {
      const item = { id: '1', name: 'Milk', quantity: 5 };
      mockDb.inventoryItem.findUnique.mockResolvedValue(item);
      const adjusted = { ...item, quantity: 3 };
      mockDb.inventoryItem.update.mockResolvedValue(adjusted);

      const result = await service.adjust('1', { amount: -2 });

      expect(mockDb.inventoryItem.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { quantity: 3 },
      });
      expect(result.quantity).toBe(3);
    });

    it('does not allow quantity to go below 0', async () => {
      const item = { id: '1', name: 'Milk', quantity: 2 };
      mockDb.inventoryItem.findUnique.mockResolvedValue(item);
      mockDb.inventoryItem.update.mockResolvedValue({ ...item, quantity: 0 });

      await service.adjust('1', { amount: -10 });

      expect(mockDb.inventoryItem.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { quantity: 0 },
      });
    });
  });

  describe('delete', () => {
    it('deletes an inventory item', async () => {
      const item = { id: '1', name: 'Milk' };
      mockDb.inventoryItem.findUnique.mockResolvedValue(item);
      mockDb.inventoryItem.delete.mockResolvedValue({});

      const result = await service.delete('1');

      expect(mockDb.inventoryItem.delete).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(result).toEqual({ success: true });
    });

    it('throws NotFoundException when item not found', async () => {
      mockDb.inventoryItem.findUnique.mockResolvedValue(null);

      await expect(service.delete('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getLowStock', () => {
    it('returns items below their low threshold', async () => {
      const items = [
        { id: '1', name: 'Milk', quantity: 1, lowThreshold: 2 },
        { id: '2', name: 'Eggs', quantity: 6, lowThreshold: 3 },
        { id: '3', name: 'Butter', quantity: 0, lowThreshold: 1 },
      ];
      mockDb.inventoryItem.findMany.mockResolvedValue(items);

      const result = await service.getLowStock();

      expect(mockDb.inventoryItem.findMany).toHaveBeenCalledWith({
        where: { lowThreshold: { not: null } },
      });
      // Should return Milk (1 <= 2) and Butter (0 <= 1), not Eggs (6 > 3)
      expect(result).toHaveLength(2);
      expect(result.map((i: { name: string }) => i.name)).toEqual(['Milk', 'Butter']);
    });
  });
});
