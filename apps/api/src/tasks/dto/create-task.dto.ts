import { IsString, IsOptional, IsArray, IsUUID, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTaskDto {
  @ApiProperty() @IsString() title: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiProperty({ enum: ['cleaning', 'cooking', 'laundry', 'kids', 'shopping', 'other'] }) @IsString() category: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() dueDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() recurring?: string;
  @ApiProperty({ type: [String] }) @IsArray() @IsUUID('4', { each: true }) assigneeIds: string[];
}
