import { Module } from '@nestjs/common';
import { FrozenMealsService } from './frozen-meals.service';
import { FrozenMealsController } from './frozen-meals.controller';

@Module({
  controllers: [FrozenMealsController],
  providers: [FrozenMealsService],
  exports: [FrozenMealsService],
})
export class FrozenMealsModule {}
