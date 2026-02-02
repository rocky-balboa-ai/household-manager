import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateMealPlanDto, UpdateMealPlanDto } from './dto/meal-plan.dto';

@Injectable()
export class MealPlansService {
  constructor(private readonly db: DatabaseService) {}

  async getByDateRange(startDate: string, endDate: string) {
    return this.db.mealPlan.findMany({
      where: {
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      orderBy: [{ date: 'asc' }, { mealType: 'asc' }],
    });
  }

  async getByDate(date: string) {
    const targetDate = new Date(date);
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    return this.db.mealPlan.findMany({
      where: {
        date: {
          gte: targetDate,
          lt: nextDate,
        },
      },
      orderBy: { mealType: 'asc' },
    });
  }

  async create(dto: CreateMealPlanDto) {
    return this.db.mealPlan.create({
      data: {
        date: new Date(dto.date),
        mealType: dto.mealType,
        description: dto.description,
        recipe: dto.recipe,
        notes: dto.notes,
      },
    });
  }

  async upsert(dto: CreateMealPlanDto) {
    const date = new Date(dto.date);
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
