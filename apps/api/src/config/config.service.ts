import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateConfigDto, UpdateConfigDto } from './dto/config.dto';

const CONFIG_TYPES = [
  'task_category',
  'inventory_category',
  'unit',
  'activity_type',
  'meal_type',
  'shopping_list_type',
  'health_log_type',
  'food_source',
  'portion_option',
  'day_off_type',
] as const;

@Injectable()
export class AppConfigService {
  constructor(private readonly db: DatabaseService) {}

  getConfigTypes() {
    return [...CONFIG_TYPES];
  }

  async getByType(type: string) {
    return this.db.appConfig.findMany({
      where: { type },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async getAll() {
    return this.db.appConfig.findMany({
      orderBy: [{ type: 'asc' }, { sortOrder: 'asc' }],
    });
  }

  async create(dto: CreateConfigDto) {
    const existing = await this.db.appConfig.findFirst({
      where: { type: dto.type, value: dto.value },
    });
    if (existing) {
      throw new BadRequestException('Config value already exists for this type');
    }

    const maxOrder = await this.db.appConfig.findFirst({
      where: { type: dto.type },
      orderBy: { sortOrder: 'desc' },
    });
    const sortOrder = dto.sortOrder ?? (maxOrder ? maxOrder.sortOrder + 1 : 0);

    return this.db.appConfig.create({
      data: {
        type: dto.type,
        value: dto.value,
        label: dto.label,
        sortOrder,
      },
    });
  }

  async update(id: string, dto: UpdateConfigDto) {
    const existing = await this.db.appConfig.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Config item not found');
    }

    return this.db.appConfig.update({
      where: { id },
      data: dto,
    });
  }

  async delete(id: string) {
    const existing = await this.db.appConfig.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Config item not found');
    }

    await this.db.appConfig.delete({ where: { id } });
    return { success: true };
  }
}
