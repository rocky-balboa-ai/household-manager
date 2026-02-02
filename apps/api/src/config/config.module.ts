import { Module } from '@nestjs/common';
import { AppConfigController } from './config.controller';
import { AppConfigService } from './config.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [AppConfigController],
  providers: [AppConfigService],
  exports: [AppConfigService],
})
export class AppConfigModule {}
