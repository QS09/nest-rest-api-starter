import { Injectable } from '@nestjs/common';
import { EventGateway } from './event.gateway';

@Injectable()
export class EventService {
  constructor(private eventGateway: EventGateway) {}

  broadcastMessage(payload: any) {
    this.eventGateway.broadcastMessage(payload);
  }

  sendMessageToRoom(roomId: string, payload: any) {
    this.eventGateway.sendMessageToRoom(roomId, payload);
  }
}
