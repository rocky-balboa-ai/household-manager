import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { FredScheduleService } from './fred-schedule.service';
import { CreateFredScheduleDto, UpdateFredScheduleDto } from './dto/create-fred-schedule.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('fred-schedule')
@Controller('fred-schedule')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class FredScheduleController {
  constructor(private readonly service: FredScheduleService) {}

  @Get() @ApiOperation({ summary: 'Get all schedules' })
  findAll() { return this.service.findAll(); }

  @Post() @Roles('ADMIN') @ApiOperation({ summary: 'Create/update schedule' })
  create(@Body() dto: CreateFredScheduleDto) { return this.service.create(dto); }

  @Patch(':date') @Roles('ADMIN') @ApiOperation({ summary: 'Update schedule for date' })
  update(@Param('date') date: string, @Body() dto: UpdateFredScheduleDto) { return this.service.update(date, dto); }

  @Delete(':date') @Roles('ADMIN') @ApiOperation({ summary: 'Delete schedule' })
  delete(@Param('date') date: string) { return this.service.delete(date); }
}
