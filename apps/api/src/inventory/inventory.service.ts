import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateInventoryDto, UpdateInventoryDto, AdjustInventoryDto } from './dto/create-inventory.dto';
import { WebsocketGateway } from '../websocket/websocket.gateway';

@Injectable()
export class InventoryService {
  constructor(
    private readonly db: DatabaseService,
    private readonly ws: WebsocketGateway,
  ) {}

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
    const item = await this.db.inventoryItem.create({ data: { ...dto, quantity: dto.quantity || 0 } });
    this.ws.emitInventoryUpdated(item);
    return item;
  }

  async update(id: string, dto: UpdateInventoryDto) {
    await this.findOne(id);
    const item = await this.db.inventoryItem.update({ where: { id }, data: dto });
    this.ws.emitInventoryUpdated(item);
    return item;
  }

  async adjust(id: string, dto: AdjustInventoryDto) {
    const item = await this.findOne(id);
    const newQuantity = Math.max(0, item.quantity + dto.amount);
    const updated = await this.db.inventoryItem.update({ where: { id }, data: { quantity: newQuantity } });
    this.ws.emitInventoryUpdated(updated);
    return updated;
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
