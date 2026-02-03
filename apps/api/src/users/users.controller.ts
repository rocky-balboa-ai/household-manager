import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto, UpdateLanguageDto, CreateUserDto, ResetPasswordDto, SetPinDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get() @ApiOperation({ summary: 'Get all users' })
  findAll() { return this.usersService.findAll(); }

  @Get(':id') @ApiOperation({ summary: 'Get user by ID' })
  findOne(@Param('id') id: string) { return this.usersService.findOne(id); }

  @Post() @ApiOperation({ summary: 'Create new user (Admin only)' })
  @Roles('ADMIN')
  create(@Body() dto: CreateUserDto) { return this.usersService.create(dto); }

  @Patch(':id') @ApiOperation({ summary: 'Update user' })
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) { return this.usersService.update(id, dto); }

  @Patch(':id/language') @ApiOperation({ summary: 'Update user language' })
  updateLanguage(@Param('id') id: string, @Body() dto: UpdateLanguageDto) { return this.usersService.updateLanguage(id, dto.language); }

  @Delete(':id') @ApiOperation({ summary: 'Delete user (Admin only)' })
  @Roles('ADMIN')
  remove(@Param('id') id: string) { return this.usersService.delete(id); }

  @Post(':id/reset-pin') @ApiOperation({ summary: 'Reset user PIN (Admin only)' })
  @Roles('ADMIN')
  resetPin(@Param('id') id: string) { return this.usersService.resetPin(id); }

  @Post(':id/set-pin') @ApiOperation({ summary: 'Set user PIN to specific value (Admin only)' })
  @Roles('ADMIN')
  setPin(@Param('id') id: string, @Body() dto: SetPinDto) { return this.usersService.setPin(id, dto.pin); }

  @Post(':id/reset-password') @ApiOperation({ summary: 'Reset user password (Admin only)' })
  @Roles('ADMIN')
  resetPassword(@Param('id') id: string, @Body() dto: ResetPasswordDto) { return this.usersService.resetPassword(id, dto.password); }
}
