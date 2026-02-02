import { IsString, IsOptional, IsEmail, MinLength, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional() @IsOptional() @IsString() name?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() phone?: string;
  @ApiPropertyOptional({ enum: ['en', 'ur', 'tl', 'sw', 'am'] }) @IsOptional() @IsString() language?: string;
}

export class UpdateLanguageDto {
  @ApiPropertyOptional({ enum: ['en', 'ur', 'tl', 'sw', 'am'] }) @IsString() language: string;
}

export class CreateUserDto {
  @ApiProperty() @IsString() name: string;
  @ApiProperty() @IsEmail() email: string;
  @ApiProperty() @IsString() @MinLength(6) password: string;
  @ApiProperty({ enum: ['ADMIN', 'MANAGER', 'DRIVER', 'NANNY', 'MAID'] }) @IsEnum(['ADMIN', 'MANAGER', 'DRIVER', 'NANNY', 'MAID']) role: 'ADMIN' | 'MANAGER' | 'DRIVER' | 'NANNY' | 'MAID';
  @ApiPropertyOptional() @IsOptional() @IsString() phone?: string;
  @ApiPropertyOptional({ enum: ['en', 'ur', 'tl', 'sw', 'am'] }) @IsOptional() @IsString() language?: string;
  @ApiPropertyOptional({ enum: ['en', 'ur', 'tl', 'sw', 'am'] }) @IsOptional() @IsString() altLanguage?: string;
}

export class ResetPasswordDto {
  @ApiProperty() @IsString() @MinLength(6) password: string;
}
