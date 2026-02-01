import { IsString, Length, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PinVerifyDto {
  @ApiPropertyOptional({ description: 'User ID for staff login' })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional({ description: 'Email for manager login' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ example: '1234' })
  @IsString()
  @Length(4, 6)
  pin: string;
}
