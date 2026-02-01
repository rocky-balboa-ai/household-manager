import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DayOffService } from './day-off.service';
import { CreateDayOffDto, UpdateDayOffDto } from './dto/create-day-off.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('day-off')
@Controller('day-offs')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class DayOffController {
  constructor(private readonly service: DayOffService) {}

  @Get() @ApiOperation({ summary: 'Get all day-offs' })
  findAll(@CurrentUser() user: any) { return this.service.findAll(user.id, user.role); }

  @Post() @ApiOperation({ summary: 'Request day off' })
  create(@Body() dto: CreateDayOffDto, @CurrentUser() user: any) { return this.service.create(dto, user.id); }

  @Patch(':id') @Roles('ADMIN', 'MANAGER') @ApiOperation({ summary: 'Approve/deny day off' })
  update(@Param('id') id: string, @Body() dto: UpdateDayOffDto, @CurrentUser() user: any) { return this.service.update(id, dto, user.id); }

  @Delete(':id') @ApiOperation({ summary: 'Delete day off request' })
  delete(@Param('id') id: string, @CurrentUser() user: any) { return this.service.delete(id, user.id, user.role); }
}
