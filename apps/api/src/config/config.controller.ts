import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AppConfigService } from './config.service';
import { CreateConfigDto, UpdateConfigDto } from './dto/config.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('config')
@Controller('config')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AppConfigController {
  constructor(private readonly configService: AppConfigService) {}

  @Get('types')
  @ApiOperation({ summary: 'Get all available config types' })
  getTypes() {
    return this.configService.getConfigTypes();
  }

  @Get()
  @ApiOperation({ summary: 'Get all config items or filter by type' })
  getAll(@Query('type') type?: string) {
    if (type) {
      return this.configService.getByType(type);
    }
    return this.configService.getAll();
  }

  @Post()
  @ApiOperation({ summary: 'Create config item (Admin only)' })
  @Roles('ADMIN')
  create(@Body() dto: CreateConfigDto) {
    return this.configService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update config item (Admin only)' })
  @Roles('ADMIN')
  update(@Param('id') id: string, @Body() dto: UpdateConfigDto) {
    return this.configService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete config item (Admin only)' })
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.configService.delete(id);
  }
}
