import { IsString, IsOptional, IsArray, IsInt, IsBoolean, IsUUID, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateShoppingListDto {
  @ApiProperty({ enum: ['grocery', 'pharmacy'] }) @IsString() type: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() assignedTo?: string;
}

export class CreateShoppingItemDto {
  @ApiProperty() @IsString() name: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1) quantity?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() unit?: string;
}

export class UpdateShoppingItemDto {
  @ApiPropertyOptional() @IsOptional() @IsBoolean() purchased?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1) quantity?: number;
}
