import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PinRequestDto {
  @ApiProperty({ example: 'elsy@elsy.com' })
  @IsEmail()
  email: string;
}
