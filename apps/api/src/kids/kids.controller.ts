import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { KidsService } from './kids.service';
import { CreateHealthLogDto, CreateMealLogDto, CreateActivityLogDto, CreateScheduleDto, UpdateScheduleDto } from './dto/create-kids.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('kids')
@Controller('kids')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class KidsController {
  constructor(private readonly service: KidsService) {}

  @Get() @ApiOperation({ summary: 'Get all kids' })
  findAll() { return this.service.findAll(); }

  @Get('schedules/all') @ApiOperation({ summary: 'Get all schedules across all kids' })
  getAllSchedules() { return this.service.getAllSchedules(); }

  @Get(':id') @ApiOperation({ summary: 'Get kid by ID' })
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post(':id/health-log') @ApiOperation({ summary: 'Add health log' })
  addHealthLog(@Param('id') id: string, @Body() dto: CreateHealthLogDto, @CurrentUser() user: any) { return this.service.addHealthLog(id, dto, user.id); }

  @Post(':id/meal-log') @ApiOperation({ summary: 'Add meal log' })
  addMealLog(@Param('id') id: string, @Body() dto: CreateMealLogDto, @CurrentUser() user: any) { return this.service.addMealLog(id, dto, user.id); }

  @Post(':id/activity-log') @ApiOperation({ summary: 'Add activity log' })
  addActivityLog(@Param('id') id: string, @Body() dto: CreateActivityLogDto, @CurrentUser() user: any) { return this.service.addActivityLog(id, dto, user.id); }

  @Get(':id/schedules') @ApiOperation({ summary: 'Get schedules' })
  getSchedules(@Param('id') id: string) { return this.service.getSchedules(id); }

  @Post(':id/schedules') @ApiOperation({ summary: 'Create schedule' })
  createSchedule(@Param('id') id: string, @Body() dto: CreateScheduleDto) { return this.service.createSchedule(id, dto); }

  @Patch(':id/schedules/:scheduleId') @ApiOperation({ summary: 'Update schedule' })
  updateSchedule(@Param('id') id: string, @Param('scheduleId') scheduleId: string, @Body() dto: UpdateScheduleDto) { return this.service.updateSchedule(id, scheduleId, dto); }

  @Delete(':id/schedules/:scheduleId') @ApiOperation({ summary: 'Delete schedule' })
  deleteSchedule(@Param('id') id: string, @Param('scheduleId') scheduleId: string) { return this.service.deleteSchedule(id, scheduleId); }
}
