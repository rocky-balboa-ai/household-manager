import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto, UpdateLanguageDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get() @ApiOperation({ summary: 'Get all users' })
  findAll() { return this.usersService.findAll(); }

  @Get(':id') @ApiOperation({ summary: 'Get user by ID' })
  findOne(@Param('id') id: string) { return this.usersService.findOne(id); }

  @Patch(':id') @ApiOperation({ summary: 'Update user' })
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) { return this.usersService.update(id, dto); }

  @Patch(':id/language') @ApiOperation({ summary: 'Update user language' })
  updateLanguage(@Param('id') id: string, @Body() dto: UpdateLanguageDto) { return this.usersService.updateLanguage(id, dto.language); }
}
