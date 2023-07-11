import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';

import { HomeService } from './home.service';
import { HomeController } from './home.controller';

@Module({
  imports: [ConfigModule, TerminusModule],
  controllers: [HomeController],
  providers: [HomeService],
})
export class HomeModule {}
