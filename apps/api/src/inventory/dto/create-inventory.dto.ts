import { IsString, IsOptional, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateInventoryDto {
  @ApiProperty() @IsString() name: string;
  @ApiProperty({ enum: ['pantry', 'freezer', 'fridge', 'shisha'] }) @IsString() category: string;
  @ApiPropertyOptional() @IsOptional() @IsString() subCategory?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) quantity?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() unit?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) lowThreshold?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() location?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() brand?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() flavor?: string;
}

export class UpdateInventoryDto extends CreateInventoryDto {}

export class AdjustInventoryDto {
  @ApiProperty({ description: 'Amount to add (positive) or remove (negative)' }) @IsInt() amount: number;
}
