import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateHealthLogDto, CreateMealLogDto, CreateActivityLogDto, CreateScheduleDto, UpdateScheduleDto } from './dto/create-kids.dto';

@Injectable()
export class KidsService {
  constructor(private readonly db: DatabaseService) {}

  async findAll() {
    return this.db.kid.findMany({ include: { healthLogs: { take: 5, orderBy: { createdAt: 'desc' } }, mealLogs: { take: 5, orderBy: { createdAt: 'desc' } }, schedules: { where: { active: true } } } });
  }

  async findOne(id: string) {
    const kid = await this.db.kid.findUnique({ where: { id }, include: { healthLogs: { orderBy: { createdAt: 'desc' } }, mealLogs: { orderBy: { createdAt: 'desc' } }, activityLogs: { orderBy: { createdAt: 'desc' } }, schedules: true } });
    if (!kid) throw new NotFoundException('Kid not found');
    return kid;
  }

  async addHealthLog(kidId: string, dto: CreateHealthLogDto, loggedBy: string) {
    await this.findOne(kidId);
    return this.db.healthLog.create({ data: { kidId, ...dto, loggedBy } });
  }

  async addMealLog(kidId: string, dto: CreateMealLogDto, loggedBy: string) {
    await this.findOne(kidId);
    if (dto.frozenMealId) {
      await this.db.frozenMeal.update({ where: { id: dto.frozenMealId }, data: { quantity: { decrement: 1 } } });
    }
    const portionsMap: Record<string, number> = { all: 1, most: 0.75, half: 0.5, little: 0.25, none: 0 };
    const { portions, ...rest } = dto;
    return this.db.mealLog.create({ data: { kidId, ...rest, portions: portions ? portionsMap[portions] : null, loggedBy } });
  }

  async addActivityLog(kidId: string, dto: CreateActivityLogDto, loggedBy: string) {
    await this.findOne(kidId);
    return this.db.kidActivityLog.create({ data: { kidId, ...dto, loggedBy } });
  }

  async getSchedules(kidId: string) {
    await this.findOne(kidId);
    return this.db.kidSchedule.findMany({ where: { kidId }, orderBy: [{ dayOfWeek: 'asc' }, { time: 'asc' }] });
  }

  async createSchedule(kidId: string, dto: CreateScheduleDto) {
    await this.findOne(kidId);
    return this.db.kidSchedule.create({ data: { kidId, ...dto } });
  }

  async updateSchedule(kidId: string, scheduleId: string, dto: UpdateScheduleDto) {
    const schedule = await this.db.kidSchedule.findUnique({ where: { id: scheduleId } });
    if (!schedule || schedule.kidId !== kidId) throw new NotFoundException('Schedule not found');
    return this.db.kidSchedule.update({ where: { id: scheduleId }, data: dto });
  }

  async deleteSchedule(kidId: string, scheduleId: string) {
    const schedule = await this.db.kidSchedule.findUnique({ where: { id: scheduleId } });
    if (!schedule || schedule.kidId !== kidId) throw new NotFoundException('Schedule not found');
    await this.db.kidSchedule.delete({ where: { id: scheduleId } });
    return { success: true };
  }
}
