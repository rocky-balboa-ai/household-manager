import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateMealPlanDto, UpdateMealPlanDto } from './dto/meal-plan.dto';

@Injectable()
export class MealPlansService {
  private readonly logger = new Logger(MealPlansService.name);

  constructor(private readonly db: DatabaseService) {}

  // Normalize date string to noon UTC to avoid timezone issues
  private normalizeDate(dateStr: string): Date {
    // Parse as YYYY-MM-DD and set to noon UTC
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  }

  async getByDateRange(startDate: string, endDate: string) {
    // Use start of day for start and end of day for end
    const start = this.normalizeDate(startDate);
    start.setUTCHours(0, 0, 0, 0);
    const end = this.normalizeDate(endDate);
    end.setUTCHours(23, 59, 59, 999);

    return this.db.mealPlan.findMany({
      where: {
        date: {
          gte: start,
          lte: end,
        },
      },
      orderBy: [{ date: 'asc' }, { mealType: 'asc' }],
    });
  }

  async getByDate(date: string) {
    const targetDate = this.normalizeDate(date);
    const startOfDay = new Date(targetDate);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    return this.db.mealPlan.findMany({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      orderBy: { mealType: 'asc' },
    });
  }

  async create(dto: CreateMealPlanDto) {
    const date = this.normalizeDate(dto.date);
    this.logger.log(`Creating meal plan for ${dto.date} (${date.toISOString()}) - ${dto.mealType}`);
    
    return this.db.mealPlan.create({
      data: {
        date,
        mealType: dto.mealType,
        description: dto.description,
        recipe: dto.recipe,
        notes: dto.notes,
      },
    });
  }

  async upsert(dto: CreateMealPlanDto) {
    const date = this.normalizeDate(dto.date);
    this.logger.log(`Upserting meal plan for ${dto.date} (${date.toISOString()}) - ${dto.mealType}: ${dto.description}`);
    
    return this.db.mealPlan.upsert({
      where: { date_mealType: { date, mealType: dto.mealType } },
      update: {
        description: dto.description,
        recipe: dto.recipe,
        notes: dto.notes,
      },
      create: {
        date,
        mealType: dto.mealType,
        description: dto.description,
        recipe: dto.recipe,
        notes: dto.notes,
      },
    });
  }

  async update(id: string, dto: UpdateMealPlanDto) {
    const existing = await this.db.mealPlan.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Meal plan not found');
    }
    return this.db.mealPlan.update({
      where: { id },
      data: dto,
    });
  }

  async delete(id: string) {
    const existing = await this.db.mealPlan.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Meal plan not found');
    }
    await this.db.mealPlan.delete({ where: { id } });
    return { success: true };
  }
}
