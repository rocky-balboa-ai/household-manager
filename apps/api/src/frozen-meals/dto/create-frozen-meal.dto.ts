import { IsString, IsOptional, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFrozenMealDto {
  @ApiProperty() @IsString() name: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) quantity?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
}

export class UpdateFrozenMealDto extends CreateFrozenMealDto {}

export class AdjustFrozenMealDto {
  @ApiProperty() @IsInt() amount: number;
}
