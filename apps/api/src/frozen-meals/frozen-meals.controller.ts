import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FrozenMealsService } from './frozen-meals.service';
import { CreateFrozenMealDto, UpdateFrozenMealDto, AdjustFrozenMealDto } from './dto/create-frozen-meal.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('frozen-meals')
@Controller('frozen-meals')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FrozenMealsController {
  constructor(private readonly service: FrozenMealsService) {}

  @Get() @ApiOperation({ summary: 'Get all frozen meals' })
  findAll() { return this.service.findAll(); }

  @Get(':id') @ApiOperation({ summary: 'Get by ID' })
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post() @ApiOperation({ summary: 'Create frozen meal' })
  create(@Body() dto: CreateFrozenMealDto) { return this.service.create(dto); }

  @Patch(':id') @ApiOperation({ summary: 'Update frozen meal' })
  update(@Param('id') id: string, @Body() dto: UpdateFrozenMealDto) { return this.service.update(id, dto); }

  @Post(':id/adjust') @ApiOperation({ summary: 'Adjust quantity' })
  adjust(@Param('id') id: string, @Body() dto: AdjustFrozenMealDto) { return this.service.adjust(id, dto.amount); }

  @Delete(':id') @ApiOperation({ summary: 'Delete frozen meal' })
  delete(@Param('id') id: string) { return this.service.delete(id); }
}
