import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateFrozenMealDto, UpdateFrozenMealDto } from './dto/create-frozen-meal.dto';

@Injectable()
export class FrozenMealsService {
  constructor(private readonly db: DatabaseService) {}

  async findAll() { return this.db.frozenMeal.findMany({ orderBy: { name: 'asc' } }); }

  async findOne(id: string) {
    const meal = await this.db.frozenMeal.findUnique({ where: { id } });
    if (!meal) throw new NotFoundException('Frozen meal not found');
    return meal;
  }

  async create(dto: CreateFrozenMealDto) {
    return this.db.frozenMeal.create({ data: { ...dto, quantity: dto.quantity || 0 } });
  }

  async update(id: string, dto: UpdateFrozenMealDto) {
    await this.findOne(id);
    return this.db.frozenMeal.update({ where: { id }, data: dto });
  }

  async adjust(id: string, amount: number) {
    const meal = await this.findOne(id);
    const newQuantity = Math.max(0, meal.quantity + amount);
    return this.db.frozenMeal.update({ where: { id }, data: { quantity: newQuantity } });
  }

  async delete(id: string) {
    await this.findOne(id);
    await this.db.frozenMeal.delete({ where: { id } });
    return { success: true };
  }
}
