import { Test, TestingModule } from '@nestjs/testing';
import { KidsService } from './kids.service';
import { DatabaseService } from '../database/database.service';
import { NotFoundException } from '@nestjs/common';

describe('KidsService', () => {
  let service: KidsService;

  const mockDb = {
    kid: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    kidSchedule: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    healthLog: {
      create: jest.fn(),
    },
    mealLog: {
      create: jest.fn(),
    },
    kidActivityLog: {
      create: jest.fn(),
    },
    frozenMeal: {
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KidsService,
        { provide: DatabaseService, useValue: mockDb },
      ],
    }).compile();

    service = module.get<KidsService>(KidsService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('returns all kids with recent logs and active schedules', async () => {
      const kids = [
        { id: '1', name: 'Emma', healthLogs: [], mealLogs: [], schedules: [] },
        { id: '2', name: 'Liam', healthLogs: [], mealLogs: [], schedules: [] },
      ];
      mockDb.kid.findMany.mockResolvedValue(kids);

      const result = await service.findAll();

      expect(mockDb.kid.findMany).toHaveBeenCalledWith({
        include: {
          healthLogs: { take: 5, orderBy: { createdAt: 'desc' } },
          mealLogs: { take: 5, orderBy: { createdAt: 'desc' } },
          schedules: { where: { active: true } },
        },
      });
      expect(result).toEqual(kids);
    });
  });

  describe('getAllSchedules', () => {
    it('returns all active schedules', async () => {
      const schedules = [
        { id: '1', activity: 'School', dayOfWeek: 1, kid: { id: '1', name: 'Emma' } },
        { id: '2', activity: 'Piano', dayOfWeek: 3, kid: { id: '2', name: 'Liam' } },
      ];
      mockDb.kidSchedule.findMany.mockResolvedValue(schedules);

      const result = await service.getAllSchedules();

      expect(mockDb.kidSchedule.findMany).toHaveBeenCalledWith({
        where: { active: true },
        include: { kid: { select: { id: true, name: true } } },
        orderBy: [{ dayOfWeek: 'asc' }, { time: 'asc' }],
      });
      expect(result).toEqual(schedules);
    });
  });

  describe('findOne', () => {
    it('returns a kid with all logs and schedules', async () => {
      const kid = {
        id: '1',
        name: 'Emma',
        healthLogs: [],
        mealLogs: [],
        activityLogs: [],
        schedules: [],
      };
      mockDb.kid.findUnique.mockResolvedValue(kid);

      const result = await service.findOne('1');

      expect(mockDb.kid.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: {
          healthLogs: { orderBy: { createdAt: 'desc' } },
          mealLogs: { orderBy: { createdAt: 'desc' } },
          activityLogs: { orderBy: { createdAt: 'desc' } },
          schedules: true,
        },
      });
      expect(result).toEqual(kid);
    });

    it('throws NotFoundException when kid not found', async () => {
      mockDb.kid.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('addHealthLog', () => {
    it('adds a health log for a kid', async () => {
      const kid = { id: '1', name: 'Emma' };
      mockDb.kid.findUnique.mockResolvedValue(kid);
      const dto = { type: 'poop', notes: 'Normal' };
      const log = { id: 'log1', kidId: '1', ...dto, loggedBy: 'user1' };
      mockDb.healthLog.create.mockResolvedValue(log);

      const result = await service.addHealthLog('1', dto, 'user1');

      expect(mockDb.healthLog.create).toHaveBeenCalledWith({
        data: { kidId: '1', ...dto, loggedBy: 'user1' },
      });
      expect(result).toEqual(log);
    });

    it('throws NotFoundException when kid not found', async () => {
      mockDb.kid.findUnique.mockResolvedValue(null);

      await expect(service.addHealthLog('nonexistent', { type: 'poop' }, 'user1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('addMealLog', () => {
    it('adds a meal log for a kid', async () => {
      const kid = { id: '1', name: 'Emma' };
      mockDb.kid.findUnique.mockResolvedValue(kid);
      const dto = { mealType: 'lunch', foodSource: 'fresh', foodName: 'Pasta with vegetables', rating: 4 };
      const log = { id: 'log1', kidId: '1', ...dto, loggedBy: 'user1' };
      mockDb.mealLog.create.mockResolvedValue(log);

      const result = await service.addMealLog('1', dto, 'user1');

      expect(mockDb.mealLog.create).toHaveBeenCalledWith({
        data: { kidId: '1', mealType: 'lunch', foodSource: 'fresh', foodName: 'Pasta with vegetables', rating: 4, portions: null, loggedBy: 'user1' },
      });
      expect(result).toEqual(log);
    });

    it('converts portions string to number', async () => {
      const kid = { id: '1', name: 'Emma' };
      mockDb.kid.findUnique.mockResolvedValue(kid);
      const dto = { mealType: 'dinner', foodSource: 'fresh', foodName: 'Rice', rating: 3, portions: 'half' };
      mockDb.mealLog.create.mockResolvedValue({});

      await service.addMealLog('1', dto, 'user1');

      expect(mockDb.mealLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ portions: 0.5 }),
      });
    });

    it('decrements frozen meal quantity when frozenMealId provided', async () => {
      const kid = { id: '1', name: 'Emma' };
      mockDb.kid.findUnique.mockResolvedValue(kid);
      const dto = { mealType: 'lunch', foodSource: 'frozen', foodName: 'Lasagna', rating: 5, frozenMealId: 'fm1' };
      mockDb.mealLog.create.mockResolvedValue({});

      await service.addMealLog('1', dto, 'user1');

      expect(mockDb.frozenMeal.update).toHaveBeenCalledWith({
        where: { id: 'fm1' },
        data: { quantity: { decrement: 1 } },
      });
    });
  });

  describe('addActivityLog', () => {
    it('adds an activity log for a kid', async () => {
      const kid = { id: '1', name: 'Emma' };
      mockDb.kid.findUnique.mockResolvedValue(kid);
      const dto = { activity: 'Afternoon nap', category: 'nap', notes: 'Good nap' };
      const log = { id: 'log1', kidId: '1', ...dto, loggedBy: 'user1' };
      mockDb.kidActivityLog.create.mockResolvedValue(log);

      const result = await service.addActivityLog('1', dto, 'user1');

      expect(mockDb.kidActivityLog.create).toHaveBeenCalledWith({
        data: { kidId: '1', ...dto, loggedBy: 'user1' },
      });
      expect(result).toEqual(log);
    });
  });

  describe('getSchedules', () => {
    it('returns schedules for a specific kid', async () => {
      const kid = { id: '1', name: 'Emma' };
      mockDb.kid.findUnique.mockResolvedValue(kid);
      const schedules = [
        { id: '1', activity: 'School', dayOfWeek: 1 },
        { id: '2', activity: 'Piano', dayOfWeek: 3 },
      ];
      mockDb.kidSchedule.findMany.mockResolvedValue(schedules);

      const result = await service.getSchedules('1');

      expect(mockDb.kidSchedule.findMany).toHaveBeenCalledWith({
        where: { kidId: '1' },
        orderBy: [{ dayOfWeek: 'asc' }, { time: 'asc' }],
      });
      expect(result).toEqual(schedules);
    });
  });

  describe('createSchedule', () => {
    it('creates a schedule for a kid', async () => {
      const kid = { id: '1', name: 'Emma' };
      mockDb.kid.findUnique.mockResolvedValue(kid);
      const dto = { activity: 'Swimming', dayOfWeek: 2, time: '14:00' };
      const schedule = { id: 'sched1', kidId: '1', ...dto };
      mockDb.kidSchedule.create.mockResolvedValue(schedule);

      const result = await service.createSchedule('1', dto);

      expect(mockDb.kidSchedule.create).toHaveBeenCalledWith({
        data: { kidId: '1', ...dto },
      });
      expect(result).toEqual(schedule);
    });
  });

  describe('updateSchedule', () => {
    it('updates a schedule', async () => {
      const kid = { id: '1', name: 'Emma' };
      mockDb.kid.findUnique.mockResolvedValue(kid);
      const schedule = { id: 'sched1', kidId: '1', activity: 'Swimming', dayOfWeek: 2, time: '14:00' };
      mockDb.kidSchedule.findUnique.mockResolvedValue(schedule);
      const dto = { activity: 'Swimming Lessons', dayOfWeek: 2, time: '15:00' };
      const updated = { ...schedule, activity: 'Swimming Lessons', time: '15:00' };
      mockDb.kidSchedule.update.mockResolvedValue(updated);

      const result = await service.updateSchedule('1', 'sched1', dto);

      expect(mockDb.kidSchedule.update).toHaveBeenCalledWith({
        where: { id: 'sched1' },
        data: dto,
      });
      expect(result).toEqual(updated);
    });

    it('throws NotFoundException when schedule not found', async () => {
      const kid = { id: '1', name: 'Emma' };
      mockDb.kid.findUnique.mockResolvedValue(kid);
      mockDb.kidSchedule.findUnique.mockResolvedValue(null);

      await expect(service.updateSchedule('1', 'nonexistent', { activity: 'Test', dayOfWeek: 1, time: '10:00' })).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException when schedule belongs to different kid', async () => {
      const kid = { id: '1', name: 'Emma' };
      mockDb.kid.findUnique.mockResolvedValue(kid);
      const schedule = { id: 'sched1', kidId: '2', activity: 'Swimming' }; // different kid
      mockDb.kidSchedule.findUnique.mockResolvedValue(schedule);

      await expect(service.updateSchedule('1', 'sched1', { activity: 'Test', dayOfWeek: 1, time: '10:00' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteSchedule', () => {
    it('deletes a schedule', async () => {
      const kid = { id: '1', name: 'Emma' };
      mockDb.kid.findUnique.mockResolvedValue(kid);
      const schedule = { id: 'sched1', kidId: '1', activity: 'Swimming' };
      mockDb.kidSchedule.findUnique.mockResolvedValue(schedule);
      mockDb.kidSchedule.delete.mockResolvedValue({});

      const result = await service.deleteSchedule('1', 'sched1');

      expect(mockDb.kidSchedule.delete).toHaveBeenCalledWith({ where: { id: 'sched1' } });
      expect(result).toEqual({ success: true });
    });

    it('throws NotFoundException when schedule not found', async () => {
      const kid = { id: '1', name: 'Emma' };
      mockDb.kid.findUnique.mockResolvedValue(kid);
      mockDb.kidSchedule.findUnique.mockResolvedValue(null);

      await expect(service.deleteSchedule('1', 'nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});
