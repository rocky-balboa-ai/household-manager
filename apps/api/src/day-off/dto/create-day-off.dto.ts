import { IsString, IsDateString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDayOffDto {
  @ApiProperty() @IsDateString() date: string;
  @ApiProperty({ enum: ['full', 'half_am', 'half_pm'] }) @IsString() type: string;
}

export class UpdateDayOffDto {
  @ApiProperty({ enum: ['approved', 'denied'] }) @IsString() status: string;
}
