import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateFredScheduleDto, UpdateFredScheduleDto } from './dto/create-fred-schedule.dto';

@Injectable()
export class FredScheduleService {
  constructor(private readonly db: DatabaseService) {}

  async findAll() {
    return this.db.fredSchedule.findMany({ orderBy: { date: 'asc' } });
  }

  async findByDateRange(startDate: Date, endDate: Date) {
    return this.db.fredSchedule.findMany({
      where: { date: { gte: startDate, lte: endDate } },
      orderBy: { date: 'asc' },
    });
  }

  async create(dto: CreateFredScheduleDto) {
    const date = new Date(dto.date);
    date.setHours(0, 0, 0, 0);
    const existing = await this.db.fredSchedule.findUnique({ where: { date } });
    if (existing) {
      return this.db.fredSchedule.update({ where: { date }, data: { location: dto.location } });
    }
    return this.db.fredSchedule.create({ data: { date, location: dto.location } });
  }

  async update(dateStr: string, dto: UpdateFredScheduleDto) {
    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);
    const schedule = await this.db.fredSchedule.findUnique({ where: { date } });
    if (!schedule) throw new NotFoundException('Schedule not found for this date');
    return this.db.fredSchedule.update({ where: { date }, data: { location: dto.location } });
  }

  async delete(dateStr: string) {
    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);
    const schedule = await this.db.fredSchedule.findUnique({ where: { date } });
    if (!schedule) throw new NotFoundException('Schedule not found');
    await this.db.fredSchedule.delete({ where: { date } });
    return { success: true };
  }
}
