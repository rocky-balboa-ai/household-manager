import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ShoppingService } from './shopping.service';
import { CreateShoppingListDto, CreateShoppingItemDto, UpdateShoppingItemDto } from './dto/create-shopping.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('shopping')
@Controller('shopping-lists')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ShoppingController {
  constructor(private readonly service: ShoppingService) {}

  @Get() @ApiOperation({ summary: 'Get all lists' }) @ApiQuery({ name: 'type', required: false })
  findAll(@Query('type') type?: string) { return this.service.findAll(type); }

  @Get(':id') @ApiOperation({ summary: 'Get list by ID' })
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post() @ApiOperation({ summary: 'Create list' })
  create(@Body() dto: CreateShoppingListDto) { return this.service.create(dto); }

  @Post(':id/items') @ApiOperation({ summary: 'Add item to list' })
  addItem(@Param('id') id: string, @Body() dto: CreateShoppingItemDto) { return this.service.addItem(id, dto); }

  @Patch(':id/items/:itemId') @ApiOperation({ summary: 'Update item' })
  updateItem(@Param('id') id: string, @Param('itemId') itemId: string, @Body() dto: UpdateShoppingItemDto) { return this.service.updateItem(id, itemId, dto); }

  @Delete(':id/items/:itemId') @ApiOperation({ summary: 'Delete item' })
  deleteItem(@Param('id') id: string, @Param('itemId') itemId: string) { return this.service.deleteItem(id, itemId); }

  @Post(':id/complete') @ApiOperation({ summary: 'Complete list' })
  complete(@Param('id') id: string) { return this.service.complete(id); }

  @Delete(':id') @ApiOperation({ summary: 'Delete list' })
  delete(@Param('id') id: string) { return this.service.delete(id); }
}
