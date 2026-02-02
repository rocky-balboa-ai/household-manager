import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { MealPlansService } from './meal-plans.service';
import { CreateMealPlanDto, UpdateMealPlanDto } from './dto/meal-plan.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('meal-plans')
@Controller('meal-plans')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class MealPlansController {
  constructor(private readonly mealPlansService: MealPlansService) {}

  @Get()
  @ApiOperation({ summary: 'Get meal plans by date range' })
  @ApiQuery({ name: 'start', required: true, description: 'Start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'end', required: true, description: 'End date (YYYY-MM-DD)' })
  getByDateRange(@Query('start') start: string, @Query('end') end: string) {
    return this.mealPlansService.getByDateRange(start, end);
  }

  @Get('date/:date')
  @ApiOperation({ summary: 'Get meal plans for a specific date' })
  getByDate(@Param('date') date: string) {
    return this.mealPlansService.getByDate(date);
  }

  @Post()
  @ApiOperation({ summary: 'Create or update a meal plan (Admin/Manager only)' })
  @Roles('ADMIN', 'MANAGER')
  upsert(@Body() dto: CreateMealPlanDto) {
    return this.mealPlansService.upsert(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a meal plan (Admin/Manager only)' })
  @Roles('ADMIN', 'MANAGER')
  update(@Param('id') id: string, @Body() dto: UpdateMealPlanDto) {
    return this.mealPlansService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a meal plan (Admin/Manager only)' })
  @Roles('ADMIN', 'MANAGER')
  delete(@Param('id') id: string) {
    return this.mealPlansService.delete(id);
  }
}
