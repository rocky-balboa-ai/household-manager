import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto, CompleteTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('tasks')
@Controller('tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get() @ApiOperation({ summary: 'Get all tasks' })
  findAll(@CurrentUser() user: any) { return this.tasksService.findAll(user.id, user.role); }

  @Get(':id') @ApiOperation({ summary: 'Get task by ID' })
  findOne(@Param('id') id: string) { return this.tasksService.findOne(id); }

  @Post() @Roles('ADMIN', 'MANAGER') @ApiOperation({ summary: 'Create task' })
  create(@Body() dto: CreateTaskDto, @CurrentUser() user: any) { return this.tasksService.create(dto, user.id); }

  @Patch(':id') @Roles('ADMIN', 'MANAGER') @ApiOperation({ summary: 'Update task' })
  update(@Param('id') id: string, @Body() dto: UpdateTaskDto) { return this.tasksService.update(id, dto); }

  @Post(':id/complete') @ApiOperation({ summary: 'Complete task' })
  complete(@Param('id') id: string, @Body() dto: CompleteTaskDto, @CurrentUser() user: any) { return this.tasksService.complete(id, dto, user.id); }

  @Delete(':id') @Roles('ADMIN', 'MANAGER') @ApiOperation({ summary: 'Delete task' })
  delete(@Param('id') id: string) { return this.tasksService.delete(id); }
}
