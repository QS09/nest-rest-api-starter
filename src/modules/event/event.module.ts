import { Module } from '@nestjs/common';
import { EventService } from './event.service';
import { EventGateway } from './event.gateway';

@Module({
  imports: [],
  providers: [EventGateway, EventService],
  exports: [EventService],
})
export class EventModule {}
