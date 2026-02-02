import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { ForbiddenException } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUsersService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    updateLanguage: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    resetPin: jest.fn(),
    resetPassword: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('calls service.create with the DTO', async () => {
      const createDto = {
        name: 'New User',
        email: 'new@test.com',
        password: 'password123',
        role: 'MAID' as const,
      };
      const createdUser = { id: 'new-id', ...createDto };
      mockUsersService.create.mockResolvedValue(createdUser);

      const result = await controller.create(createDto);

      expect(mockUsersService.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(createdUser);
    });
  });

  describe('remove', () => {
    it('calls service.delete with the user ID', async () => {
      mockUsersService.delete.mockResolvedValue({ success: true });

      const result = await controller.remove('user-id');

      expect(mockUsersService.delete).toHaveBeenCalledWith('user-id');
      expect(result).toEqual({ success: true });
    });
  });

  describe('resetPin', () => {
    it('calls service.resetPin with the user ID', async () => {
      mockUsersService.resetPin.mockResolvedValue({ success: true });

      const result = await controller.resetPin('user-id');

      expect(mockUsersService.resetPin).toHaveBeenCalledWith('user-id');
      expect(result).toEqual({ success: true });
    });
  });

  describe('resetPassword', () => {
    it('calls service.resetPassword with ID and new password', async () => {
      mockUsersService.resetPassword.mockResolvedValue({ success: true });
      const dto = { password: 'newPassword123' };

      const result = await controller.resetPassword('user-id', dto);

      expect(mockUsersService.resetPassword).toHaveBeenCalledWith('user-id', 'newPassword123');
      expect(result).toEqual({ success: true });
    });
  });
});
