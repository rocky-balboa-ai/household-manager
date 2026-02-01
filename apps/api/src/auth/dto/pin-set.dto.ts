import { IsString, Length, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PinSetDto {
  @ApiProperty({ description: 'User ID' })
  @IsUUID()
  userId: string;

  @ApiProperty({ example: '1234' })
  @IsString()
  @Length(4, 4)
  pin: string;
}
