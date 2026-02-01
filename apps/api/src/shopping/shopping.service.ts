import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateShoppingListDto, CreateShoppingItemDto, UpdateShoppingItemDto } from './dto/create-shopping.dto';

@Injectable()
export class ShoppingService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(type?: string) {
    return this.db.shoppingList.findMany({
      where: type ? { type } : {},
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const list = await this.db.shoppingList.findUnique({ where: { id }, include: { items: true } });
    if (!list) throw new NotFoundException('Shopping list not found');
    return list;
  }

  async create(dto: CreateShoppingListDto) {
    return this.db.shoppingList.create({ data: dto, include: { items: true } });
  }

  async addItem(listId: string, dto: CreateShoppingItemDto) {
    await this.findOne(listId);
    return this.db.shoppingItem.create({ data: { listId, ...dto, quantity: dto.quantity || 1 } });
  }

  async updateItem(listId: string, itemId: string, dto: UpdateShoppingItemDto) {
    await this.findOne(listId);
    const item = await this.db.shoppingItem.findUnique({ where: { id: itemId } });
    if (!item || item.listId !== listId) throw new NotFoundException('Item not found');
    return this.db.shoppingItem.update({ where: { id: itemId }, data: dto });
  }

  async deleteItem(listId: string, itemId: string) {
    await this.findOne(listId);
    await this.db.shoppingItem.delete({ where: { id: itemId } });
    return { success: true };
  }

  async complete(id: string) {
    await this.findOne(id);
    return this.db.shoppingList.update({ where: { id }, data: { status: 'completed', completedAt: new Date() }, include: { items: true } });
  }

  async delete(id: string) {
    await this.findOne(id);
    await this.db.shoppingList.delete({ where: { id } });
    return { success: true };
  }
}
