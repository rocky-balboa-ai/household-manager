import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional() @IsOptional() @IsString() name?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() phone?: string;
  @ApiPropertyOptional({ enum: ['en', 'ur', 'tl', 'sw', 'am'] }) @IsOptional() @IsString() language?: string;
}

export class UpdateLanguageDto {
  @ApiPropertyOptional({ enum: ['en', 'ur', 'tl', 'sw', 'am'] }) @IsString() language: string;
}
