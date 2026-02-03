import { IsString, IsOptional, IsInt, IsDateString, Min, Max, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateHealthLogDto {
  @ApiProperty({ enum: ['poop', 'pee'] }) @IsString() type: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}

export class CreateMealLogDto {
  @ApiProperty({ enum: ['breakfast', 'lunch', 'dinner', 'snack'] }) @IsString() mealType: string;
  @ApiProperty({ enum: ['frozen', 'fresh'] }) @IsString() foodSource: string;
  @ApiProperty() @IsString() foodName: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() frozenMealId?: string;
  @ApiProperty({ minimum: 1, maximum: 5 }) @IsInt() @Min(1) @Max(5) rating: number;
  @ApiPropertyOptional() @IsOptional() @IsString() photo?: string;
  @ApiPropertyOptional({ enum: ['all', 'most', 'half', 'little', 'none'] }) @IsOptional() @IsString() portions?: string;
}

export class CreateActivityLogDto {
  @ApiProperty() @IsString() activity: string;
  @ApiProperty({ enum: ['play', 'learning', 'outdoor', 'screen', 'nap', 'other'] }) @IsString() category: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}

export class CreateScheduleDto {
  @ApiProperty() @IsString() activity: string;
  @ApiProperty({ minimum: 0, maximum: 6 }) @IsInt() @Min(0) @Max(6) dayOfWeek: number;
  @ApiProperty({ example: '14:30' }) @IsString() time: string;
  @ApiPropertyOptional() @IsOptional() @IsString() location?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}

export class UpdateScheduleDto extends CreateScheduleDto {
  @ApiPropertyOptional() @IsOptional() active?: boolean;
}
