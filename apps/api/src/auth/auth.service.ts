import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { DatabaseService } from '../database/database.service';
import { PinVerifyDto } from './dto/pin-verify.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly db: DatabaseService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.db.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.generateToken(user);
  }

  async requestPin(email: string) {
    const user = await this.db.user.findUnique({ where: { email } });
    if (!user || (user.role !== 'MANAGER' && user.role !== 'ADMIN')) {
      throw new BadRequestException('Invalid email');
    }
    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedPin = await bcrypt.hash(pin, 10);
    await this.db.user.update({
      where: { id: user.id },
      data: { pin: hashedPin, pinSetAt: new Date() },
    });
    console.log(`PIN for ${email}: ${pin}`);
    return { success: true, message: 'PIN sent to email' };
  }

  async verifyPin(dto: PinVerifyDto) {
    let user;
    if (dto.userId) {
      user = await this.db.user.findUnique({ where: { id: dto.userId } });
    } else if (dto.email) {
      user = await this.db.user.findUnique({ where: { email: dto.email } });
    }
    if (!user || !user.pin) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isPinValid = await bcrypt.compare(dto.pin, user.pin);
    if (!isPinValid) {
      throw new UnauthorizedException('Invalid PIN');
    }
    return this.generateToken(user);
  }

  async setPin(userId: string, pin: string) {
    const user = await this.db.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (user.pinSetAt) {
      const pinDate = new Date(user.pinSetAt);
      pinDate.setHours(0, 0, 0, 0);
      if (pinDate.getTime() === today.getTime()) {
        throw new BadRequestException('PIN already set for today');
      }
    }
    const hashedPin = await bcrypt.hash(pin, 10);
    await this.db.user.update({
      where: { id: userId },
      data: { pin: hashedPin, pinSetAt: new Date() },
    });
    return { success: true };
  }

  async getStaffList() {
    return this.db.user.findMany({
      where: { role: { in: ['DRIVER', 'NANNY', 'MAID'] } },
      select: { id: true, name: true, role: true, language: true, pinSetAt: true },
    });
  }

  private generateToken(user: any) {
    const payload = { sub: user.id, email: user.email, role: user.role, name: user.name };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        language: user.language,
        altLanguage: user.altLanguage,
      },
    };
  }
}
