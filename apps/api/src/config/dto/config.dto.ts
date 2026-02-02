import { IsString, IsOptional, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateConfigDto {
  @ApiProperty({ description: 'Config type (e.g., task_category, unit, activity_type)' })
  @IsString()
  type: string;

  @ApiProperty({ description: 'Internal value/key' })
  @IsString()
  value: string;

  @ApiProperty({ description: 'Display label' })
  @IsString()
  label: string;

  @ApiPropertyOptional({ description: 'Sort order for display' })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class UpdateConfigDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  label?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
