import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { DatabaseService } from '../database/database.service';
import { WebsocketGateway } from '../websocket/websocket.gateway';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { TaskStatus } from 'database';

describe('TasksService', () => {
  let service: TasksService;

  const mockDb = {
    task: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    taskAssignment: {
      deleteMany: jest.fn(),
      createMany: jest.fn(),
    },
  };

  const mockWs = {
    emitTaskCreated: jest.fn(),
    emitTaskUpdated: jest.fn(),
    emitTaskCompleted: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: DatabaseService, useValue: mockDb },
        { provide: WebsocketGateway, useValue: mockWs },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('returns all tasks for admin users', async () => {
      const tasks = [
        { id: '1', title: 'Clean room', assignments: [] },
        { id: '2', title: 'Do laundry', assignments: [] },
      ];
      mockDb.task.findMany.mockResolvedValue(tasks);

      const result = await service.findAll('user1', 'ADMIN');

      expect(mockDb.task.findMany).toHaveBeenCalledWith({
        where: {},
        include: expect.any(Object),
        orderBy: expect.any(Array),
      });
      expect(result).toEqual(tasks);
    });

    it('filters tasks by assignment for non-admin users', async () => {
      mockDb.task.findMany.mockResolvedValue([]);

      await service.findAll('user1', 'NANNY');

      expect(mockDb.task.findMany).toHaveBeenCalledWith({
        where: { assignments: { some: { userId: 'user1' } } },
        include: expect.any(Object),
        orderBy: expect.any(Array),
      });
    });
  });

  describe('findOne', () => {
    it('returns a task by id', async () => {
      const task = { id: '1', title: 'Clean room', assignments: [] };
      mockDb.task.findUnique.mockResolvedValue(task);

      const result = await service.findOne('1');

      expect(mockDb.task.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: expect.any(Object),
      });
      expect(result).toEqual(task);
    });

    it('throws NotFoundException when task not found', async () => {
      mockDb.task.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('creates a new task', async () => {
      const dto = {
        title: 'Clean room',
        description: 'Deep clean the living room',
        category: 'cleaning',
        assigneeIds: ['user1', 'user2'],
      };
      const created = {
        id: 'new-id',
        title: dto.title,
        description: dto.description,
        category: dto.category,
        assignments: [
          { userId: 'user1', user: { id: 'user1', name: 'User 1' } },
          { userId: 'user2', user: { id: 'user2', name: 'User 2' } },
        ],
      };
      mockDb.task.create.mockResolvedValue(created);

      const result = await service.create(dto, 'creator-id');

      expect(mockDb.task.create).toHaveBeenCalledWith({
        data: {
          title: dto.title,
          description: dto.description,
          category: dto.category,
          dueDate: null,
          recurring: undefined,
          createdById: 'creator-id',
          assignments: { create: [{ userId: 'user1' }, { userId: 'user2' }] },
        },
        include: expect.any(Object),
      });
      expect(mockWs.emitTaskCreated).toHaveBeenCalledWith(created);
      expect(result).toEqual(created);
    });

    it('parses dueDate when provided', async () => {
      const dto = {
        title: 'Task with due date',
        category: 'cleaning',
        assigneeIds: ['user1'],
        dueDate: '2024-01-15',
      };
      mockDb.task.create.mockResolvedValue({ id: '1', ...dto, assignments: [] });

      await service.create(dto, 'creator-id');

      expect(mockDb.task.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            dueDate: new Date('2024-01-15'),
          }),
        }),
      );
    });
  });

  describe('update', () => {
    it('updates a task', async () => {
      const task = { id: '1', title: 'Clean room' };
      mockDb.task.findUnique.mockResolvedValue(task);
      const dto = { title: 'Clean living room' };
      const updated = { ...task, title: 'Clean living room', assignments: [] };
      mockDb.task.update.mockResolvedValue(updated);

      const result = await service.update('1', dto);

      expect(mockDb.task.update).toHaveBeenCalled();
      expect(mockWs.emitTaskUpdated).toHaveBeenCalledWith(updated);
      expect(result.title).toBe('Clean living room');
    });

    it('updates assignees when assigneeIds provided', async () => {
      const task = { id: '1', title: 'Clean room' };
      mockDb.task.findUnique.mockResolvedValue(task);
      const dto = { assigneeIds: ['user3', 'user4'] };
      mockDb.task.update.mockResolvedValue({ ...task, assignments: [] });

      await service.update('1', dto);

      expect(mockDb.taskAssignment.deleteMany).toHaveBeenCalledWith({ where: { taskId: '1' } });
      expect(mockDb.taskAssignment.createMany).toHaveBeenCalledWith({
        data: [{ taskId: '1', userId: 'user3' }, { taskId: '1', userId: 'user4' }],
      });
    });

    it('throws NotFoundException when task not found', async () => {
      mockDb.task.findUnique.mockResolvedValue(null);

      await expect(service.update('nonexistent', { title: 'New title' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('complete', () => {
    it('marks a task as completed by assigned user', async () => {
      const task = {
        id: '1',
        title: 'Clean room',
        assignments: [{ userId: 'user1' }],
      };
      mockDb.task.findUnique.mockResolvedValue(task);
      const completed = {
        ...task,
        status: TaskStatus.COMPLETED,
        completedAt: new Date(),
      };
      mockDb.task.update.mockResolvedValue(completed);

      const result = await service.complete('1', {}, 'user1');

      expect(mockDb.task.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          status: TaskStatus.COMPLETED,
          completedAt: expect.any(Date),
          photoProof: undefined,
        },
        include: expect.any(Object),
      });
      expect(mockWs.emitTaskCompleted).toHaveBeenCalledWith(completed);
      expect(result.status).toBe(TaskStatus.COMPLETED);
    });

    it('accepts photo proof', async () => {
      const task = { id: '1', assignments: [{ userId: 'user1' }] };
      mockDb.task.findUnique.mockResolvedValue(task);
      mockDb.task.update.mockResolvedValue({ ...task, photoProof: 'photo-url' });

      await service.complete('1', { photoProof: 'photo-url' }, 'user1');

      expect(mockDb.task.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ photoProof: 'photo-url' }),
        }),
      );
    });

    it('throws ForbiddenException when user not assigned', async () => {
      const task = {
        id: '1',
        assignments: [{ userId: 'user1' }],
      };
      mockDb.task.findUnique.mockResolvedValue(task);

      await expect(service.complete('1', {}, 'user2')).rejects.toThrow(ForbiddenException);
    });

    it('throws NotFoundException when task not found', async () => {
      mockDb.task.findUnique.mockResolvedValue(null);

      await expect(service.complete('nonexistent', {}, 'user1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('deletes a task', async () => {
      const task = { id: '1', title: 'Clean room' };
      mockDb.task.findUnique.mockResolvedValue(task);
      mockDb.task.delete.mockResolvedValue({});

      const result = await service.delete('1');

      expect(mockDb.task.delete).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(result).toEqual({ success: true });
    });

    it('throws NotFoundException when task not found', async () => {
      mockDb.task.findUnique.mockResolvedValue(null);

      await expect(service.delete('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});
