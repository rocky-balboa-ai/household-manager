import { IsString, IsDateString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMealPlanDto {
  @ApiProperty() @IsDateString() date: string;
  @ApiProperty({ enum: ['breakfast', 'lunch', 'dinner', 'snack'] }) @IsString() mealType: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() recipe?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}

export class UpdateMealPlanDto {
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() recipe?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}
