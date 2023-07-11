/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { GatewayQueryDto } from './dtos/gateway-query.dto';

import { MessageService } from '../message/message.service';
import { LineService } from '../line/line.service';
import { EventService } from '../event/event.service';
import { UserLineStatus } from '../user-line/user-line.types';
import { UserStatusEnum } from '../user/user.types';
import { instanceToPlain } from 'class-transformer';

@Injectable()
export class GatewayService {
  constructor(
    private messageService: MessageService,
    private lineService: LineService,
    private eventService: EventService,
  ) {}

  async processMessage(body: string, query: GatewayQueryDto, headers: any) {
    /**
     * TODO:
     * 1. Add message in messages table
     * 2. Get active subscriber associated with receiving number, get users with admin role
     * 3. Send websocket message to active subscriber/admins
     *  */
    const [sender, receiver, smsc, scts, ...text] = body.split('\n');
    const textJoined = text.join('\n');

    const message = {
      sender: query.sender,
      receiver: query.receiver,
      port: query.port,
      smsc: smsc.replace('SMSC: ', '').trim(),
      scts: scts.replace('SCTS: ', '').trim(),
      message: textJoined,
      isVisible: false,
      user: null,
    };
    const line = await this.lineService.findByPhoneNumber(query.receiver);
    if (line?.userLine && line.userLine?.user) {
      message.user = line.userLine.user;
      message.isVisible =
        line.userLine.status === UserLineStatus.ACTIVE &&
        line.userLine.user.status === UserStatusEnum.ACTIVE;
    }
    const messageObj = await this.messageService.create(message);

    const payload = { ...instanceToPlain(messageObj) };
    if (!messageObj.isVisible) {
      payload.message = payload.message.replace(/[^\s]/g, 'x');
    }
    delete payload.user;
    this.eventService.sendMessageToRoom(messageObj.user.id, payload);

    return { success: true };
  }
}
