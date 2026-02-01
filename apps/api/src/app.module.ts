import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TasksModule } from './tasks/tasks.module';
import { InventoryModule } from './inventory/inventory.module';
import { FrozenMealsModule } from './frozen-meals/frozen-meals.module';
import { ShoppingModule } from './shopping/shopping.module';
import { KidsModule } from './kids/kids.module';
import { DayOffModule } from './day-off/day-off.module';
import { FredScheduleModule } from './fred-schedule/fred-schedule.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    TasksModule,
    InventoryModule,
    FrozenMealsModule,
    ShoppingModule,
    KidsModule,
    DayOffModule,
    FredScheduleModule,
  ],
})
export class AppModule {}
