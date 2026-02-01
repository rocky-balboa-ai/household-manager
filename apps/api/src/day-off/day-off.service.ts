import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateDayOffDto, UpdateDayOffDto } from './dto/create-day-off.dto';

@Injectable()
export class DayOffService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(userId?: string, role?: string) {
    const where: any = {};
    if (role && !['ADMIN', 'MANAGER'].includes(role)) {
      where.userId = userId;
    }
    return this.db.dayOff.findMany({ where, include: { user: { select: { id: true, name: true, role: true } } }, orderBy: { date: 'asc' } });
  }

  async create(dto: CreateDayOffDto, userId: string) {
    return this.db.dayOff.create({ data: { ...dto, date: new Date(dto.date), userId } });
  }

  async update(id: string, dto: UpdateDayOffDto, approvedBy: string) {
    const dayOff = await this.db.dayOff.findUnique({ where: { id } });
    if (!dayOff) throw new NotFoundException('Day off not found');
    return this.db.dayOff.update({ where: { id }, data: { status: dto.status, approvedBy } });
  }

  async delete(id: string, userId: string, role: string) {
    const dayOff = await this.db.dayOff.findUnique({ where: { id } });
    if (!dayOff) throw new NotFoundException('Day off not found');
    if (!['ADMIN', 'MANAGER'].includes(role) && dayOff.userId !== userId) {
      throw new ForbiddenException('Cannot delete this request');
    }
    await this.db.dayOff.delete({ where: { id } });
    return { success: true };
  }
}
