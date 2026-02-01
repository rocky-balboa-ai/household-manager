import { IsString, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFredScheduleDto {
  @ApiProperty() @IsDateString() date: string;
  @ApiProperty({ enum: ['wfh', 'office'] }) @IsString() location: string;
}

export class UpdateFredScheduleDto {
  @ApiProperty({ enum: ['wfh', 'office'] }) @IsString() location: string;
}
