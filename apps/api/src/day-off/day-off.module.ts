import { Module } from '@nestjs/common';
import { DayOffService } from './day-off.service';
import { DayOffController } from './day-off.controller';

@Module({
  controllers: [DayOffController],
  providers: [DayOffService],
  exports: [DayOffService],
})
export class DayOffModule {}
