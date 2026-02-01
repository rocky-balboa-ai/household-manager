import { Controller, Post, Body, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { PinRequestDto } from './dto/pin-request.dto';
import { PinVerifyDto } from './dto/pin-verify.dto';
import { PinSetDto } from './dto/pin-set.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login with email and password (Admin only)' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @Post('pin-request')
  @ApiOperation({ summary: 'Request PIN to be sent to email (Manager only)' })
  async requestPin(@Body() dto: PinRequestDto) {
    return this.authService.requestPin(dto.email);
  }

  @Post('pin-verify')
  @ApiOperation({ summary: 'Verify PIN for login' })
  async verifyPin(@Body() dto: PinVerifyDto) {
    return this.authService.verifyPin(dto);
  }

  @Post('pin-set')
  @ApiOperation({ summary: 'Set daily PIN for staff' })
  async setPin(@Body() dto: PinSetDto) {
    return this.authService.setPin(dto.userId, dto.pin);
  }

  @Get('staff')
  @ApiOperation({ summary: 'Get list of staff for PIN login selection' })
  async getStaffList() {
    return this.authService.getStaffList();
  }
}
