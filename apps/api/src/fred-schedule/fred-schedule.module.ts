import { Module } from '@nestjs/common';
import { FredScheduleService } from './fred-schedule.service';
import { FredScheduleController } from './fred-schedule.controller';

@Module({
  controllers: [FredScheduleController],
  providers: [FredScheduleService],
  exports: [FredScheduleService],
})
export class FredScheduleModule {}
