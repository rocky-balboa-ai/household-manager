import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateInventoryDto, UpdateInventoryDto, AdjustInventoryDto } from './dto/create-inventory.dto';

@Injectable()
export class InventoryService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(category?: string) {
    return this.db.inventoryItem.findMany({
      where: category ? { category } : {},
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });
  }

  async findOne(id: string) {
    const item = await this.db.inventoryItem.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Inventory item not found');
    return item;
  }

  async create(dto: CreateInventoryDto) {
    return this.db.inventoryItem.create({ data: { ...dto, quantity: dto.quantity || 0 } });
  }

  async update(id: string, dto: UpdateInventoryDto) {
    await this.findOne(id);
    return this.db.inventoryItem.update({ where: { id }, data: dto });
  }

  async adjust(id: string, dto: AdjustInventoryDto) {
    const item = await this.findOne(id);
    const newQuantity = Math.max(0, item.quantity + dto.amount);
    return this.db.inventoryItem.update({ where: { id }, data: { quantity: newQuantity } });
  }

  async delete(id: string) {
    await this.findOne(id);
    await this.db.inventoryItem.delete({ where: { id } });
    return { success: true };
  }

  async getLowStock() {
    const items = await this.db.inventoryItem.findMany({ where: { lowThreshold: { not: null } } });
    return items.filter(item => item.lowThreshold && item.quantity <= item.lowThreshold);
  }
}
