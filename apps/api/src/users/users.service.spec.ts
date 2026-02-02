import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { DatabaseService } from '../database/database.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('UsersService', () => {
  let service: UsersService;
  let db: DatabaseService;

  const mockUser = {
    id: 'user-1',
    name: 'Test User',
    email: 'test@test.com',
    password: 'hashed-password',
    phone: '123-456-7890',
    role: 'MAID',
    pin: null,
    pinSetAt: null,
    language: 'en',
    altLanguage: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockAdminUser = {
    id: 'admin-1',
    name: 'Admin',
    email: 'admin@test.com',
    role: 'ADMIN',
  };

  const mockDb = {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: DatabaseService, useValue: mockDb },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    db = module.get<DatabaseService>(DatabaseService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('creates a new user with hashed password', async () => {
      const createDto = {
        name: 'New Staff',
        email: 'newstaff@test.com',
        password: 'password123',
        role: 'MAID' as const,
        language: 'en',
      };

      const createdUser = {
        id: 'new-user-id',
        name: createDto.name,
        email: createDto.email,
        phone: null,
        role: createDto.role,
        language: createDto.language,
        altLanguage: null,
        createdAt: new Date(),
      };

      mockDb.user.findUnique.mockResolvedValue(null); // Email doesn't exist
      mockDb.user.create.mockResolvedValue(createdUser);

      const result = await service.create(createDto);

      expect(mockDb.user.create).toHaveBeenCalled();
      // Password should be hashed, not plain text
      const createCall = mockDb.user.create.mock.calls[0][0];
      expect(createCall.data.password).not.toBe('password123');
      expect(result.id).toBe('new-user-id');
      expect(result.name).toBe('New Staff');
      // Password should not be returned
      expect(result).not.toHaveProperty('password');
    });

    it('rejects duplicate email addresses', async () => {
      const createDto = {
        name: 'Duplicate User',
        email: 'existing@test.com',
        password: 'password123',
        role: 'MAID' as const,
      };

      mockDb.user.findUnique.mockResolvedValue(mockUser); // Email already exists

      await expect(service.create(createDto)).rejects.toThrow('Email already exists');
    });

    it('creates user with optional phone and altLanguage', async () => {
      const createDto = {
        name: 'Staff With Phone',
        email: 'staff@test.com',
        password: 'password123',
        role: 'NANNY' as const,
        phone: '555-1234',
        language: 'en',
        altLanguage: 'tl',
      };

      mockDb.user.findUnique.mockResolvedValue(null);
      mockDb.user.create.mockResolvedValue({ id: 'new-id', ...createDto });

      const result = await service.create(createDto);

      const createCall = mockDb.user.create.mock.calls[0][0];
      expect(createCall.data.phone).toBe('555-1234');
      expect(createCall.data.altLanguage).toBe('tl');
    });
  });

  describe('delete', () => {
    it('deletes an existing user', async () => {
      mockDb.user.findUnique.mockResolvedValue(mockUser);
      mockDb.user.delete.mockResolvedValue(mockUser);

      const result = await service.delete('user-1');

      expect(mockDb.user.delete).toHaveBeenCalledWith({ where: { id: 'user-1' } });
      expect(result).toEqual({ success: true });
    });

    it('throws NotFoundException for non-existent user', async () => {
      mockDb.user.findUnique.mockResolvedValue(null);

      await expect(service.delete('non-existent')).rejects.toThrow(NotFoundException);
    });

    it('prevents deletion of ADMIN users', async () => {
      const adminUser = { ...mockUser, role: 'ADMIN' };
      mockDb.user.findUnique.mockResolvedValue(adminUser);

      await expect(service.delete('admin-user')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('resetPin', () => {
    it('clears the PIN and pinSetAt for a user', async () => {
      const userWithPin = { ...mockUser, pin: 'hashed-pin', pinSetAt: new Date() };
      mockDb.user.findUnique.mockResolvedValue(userWithPin);
      mockDb.user.update.mockResolvedValue({ ...userWithPin, pin: null, pinSetAt: null });

      const result = await service.resetPin('user-1');

      expect(mockDb.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { pin: null, pinSetAt: null },
      });
      expect(result).toEqual({ success: true });
    });

    it('throws NotFoundException for non-existent user', async () => {
      mockDb.user.findUnique.mockResolvedValue(null);

      await expect(service.resetPin('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('resetPassword', () => {
    it('sets a new hashed password for a user', async () => {
      mockDb.user.findUnique.mockResolvedValue(mockUser);
      mockDb.user.update.mockResolvedValue(mockUser);

      const result = await service.resetPassword('user-1', 'newPassword123');

      expect(mockDb.user.update).toHaveBeenCalled();
      const updateCall = mockDb.user.update.mock.calls[0][0];
      expect(updateCall.where).toEqual({ id: 'user-1' });
      // Password should be hashed
      expect(updateCall.data.password).not.toBe('newPassword123');
      expect(result).toEqual({ success: true });
    });

    it('throws NotFoundException for non-existent user', async () => {
      mockDb.user.findUnique.mockResolvedValue(null);

      await expect(service.resetPassword('non-existent', 'newPass')).rejects.toThrow(NotFoundException);
    });

    it('validates password minimum length', async () => {
      mockDb.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.resetPassword('user-1', '12345')).rejects.toThrow('Password must be at least 6 characters');
    });
  });
});
