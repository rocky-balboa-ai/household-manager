import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { UpdateUserDto, CreateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly db: DatabaseService) {}

  async create(dto: CreateUserDto) {
    const existing = await this.db.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.db.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
        role: dto.role,
        phone: dto.phone,
        language: dto.language || 'en',
        altLanguage: dto.altLanguage,
      },
      select: { id: true, name: true, email: true, phone: true, role: true, language: true, altLanguage: true, createdAt: true },
    });
    return user;
  }

  async delete(id: string) {
    const user = await this.db.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.role === 'ADMIN') {
      throw new ForbiddenException('Cannot delete admin users');
    }
    await this.db.user.delete({ where: { id } });
    return { success: true };
  }

  async resetPin(id: string) {
    const user = await this.db.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.db.user.update({
      where: { id },
      data: { pin: null, pinSetAt: null },
    });
    return { success: true };
  }

  async setPin(id: string, pin: string) {
    // Validate PIN format: 4-6 digits only
    if (!/^\d{4,6}$/.test(pin)) {
      throw new BadRequestException('PIN must be 4-6 digits');
    }
    const user = await this.db.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const hashedPin = await bcrypt.hash(pin, 10);
    await this.db.user.update({
      where: { id },
      data: { pin: hashedPin, pinSetAt: new Date() },
    });
    return { success: true };
  }

  async resetPassword(id: string, newPassword: string) {
    if (newPassword.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters');
    }
    const user = await this.db.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.db.user.update({
      where: { id },
      data: { password: hashedPassword },
    });
    return { success: true };
  }

  async findAll() {
    return this.db.user.findMany({
      select: { id: true, name: true, email: true, phone: true, role: true, language: true, altLanguage: true, createdAt: true },
    });
  }

  async findOne(id: string) {
    const user = await this.db.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, phone: true, role: true, language: true, altLanguage: true, createdAt: true },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.db.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return this.db.user.update({
      where: { id },
      data: dto,
      select: { id: true, name: true, email: true, phone: true, role: true, language: true, altLanguage: true },
    });
  }

  async updateLanguage(id: string, language: string) {
    const user = await this.db.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return this.db.user.update({
      where: { id },
      data: { language },
      select: { id: true, name: true, language: true, altLanguage: true },
    });
  }
}
