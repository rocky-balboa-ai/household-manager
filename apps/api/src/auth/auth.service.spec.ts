import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { DatabaseService } from '../database/database.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let db: DatabaseService;

  const mockDb = {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock-jwt-token'),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('test-secret'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: DatabaseService, useValue: mockDb },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    db = module.get<DatabaseService>(DatabaseService);

    jest.clearAllMocks();
  });

  describe('requestPin (Multiple Admin Support)', () => {
    it('allows ADMIN users to request a PIN', async () => {
      const adminUser = {
        id: 'admin-1',
        name: 'Fred',
        email: 'fred@haddad.com',
        role: 'ADMIN',
      };
      mockDb.user.findUnique.mockResolvedValue(adminUser);
      mockDb.user.update.mockResolvedValue(adminUser);

      const result = await service.requestPin('fred@haddad.com');

      expect(result.success).toBe(true);
      expect(mockDb.user.update).toHaveBeenCalled();
    });

    it('allows MANAGER users to request a PIN', async () => {
      const managerUser = {
        id: 'manager-1',
        name: 'Elsy',
        email: 'elsy@elsy.com',
        role: 'MANAGER',
      };
      mockDb.user.findUnique.mockResolvedValue(managerUser);
      mockDb.user.update.mockResolvedValue(managerUser);

      const result = await service.requestPin('elsy@elsy.com');

      expect(result.success).toBe(true);
      expect(mockDb.user.update).toHaveBeenCalled();
    });

    it('rejects staff users from requesting PIN via email', async () => {
      const staffUser = {
        id: 'staff-1',
        name: 'Karen',
        email: 'karen@haddad.com',
        role: 'NANNY',
      };
      mockDb.user.findUnique.mockResolvedValue(staffUser);

      await expect(service.requestPin('karen@haddad.com')).rejects.toThrow(BadRequestException);
    });

    it('rejects non-existent email', async () => {
      mockDb.user.findUnique.mockResolvedValue(null);

      await expect(service.requestPin('nobody@test.com')).rejects.toThrow(BadRequestException);
    });
  });
});
