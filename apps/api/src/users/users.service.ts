import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly db: DatabaseService) {}

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
