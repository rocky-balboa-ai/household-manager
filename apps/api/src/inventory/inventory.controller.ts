import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { CreateInventoryDto, UpdateInventoryDto, AdjustInventoryDto } from './dto/create-inventory.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('inventory')
@Controller('inventory')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get() @ApiOperation({ summary: 'Get all inventory' }) @ApiQuery({ name: 'category', required: false })
  findAll(@Query('category') category?: string) { return this.inventoryService.findAll(category); }

  @Get('low-stock') @ApiOperation({ summary: 'Get low stock items' })
  getLowStock() { return this.inventoryService.getLowStock(); }

  @Get(':id') @ApiOperation({ summary: 'Get item by ID' })
  findOne(@Param('id') id: string) { return this.inventoryService.findOne(id); }

  @Post() @ApiOperation({ summary: 'Create item' })
  create(@Body() dto: CreateInventoryDto) { return this.inventoryService.create(dto); }

  @Patch(':id') @ApiOperation({ summary: 'Update item' })
  update(@Param('id') id: string, @Body() dto: UpdateInventoryDto) { return this.inventoryService.update(id, dto); }

  @Post(':id/adjust') @ApiOperation({ summary: 'Adjust quantity' })
  adjust(@Param('id') id: string, @Body() dto: AdjustInventoryDto) { return this.inventoryService.adjust(id, dto); }

  @Delete(':id') @ApiOperation({ summary: 'Delete item' })
  delete(@Param('id') id: string) { return this.inventoryService.delete(id); }
}
