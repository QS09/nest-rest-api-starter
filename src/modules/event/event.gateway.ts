/* eslint-disable @typescript-eslint/no-unused-vars */
import { Logger } from '@nestjs/common';

import {
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayDisconnect,
  OnGatewayConnection,
  WebSocketGateway,
  WebSocketServer,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';

@WebSocketGateway({ path: '/message', cors: true })
export class EventGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('EventGateway');
  private rooms: { [key: string]: any[] } = {};

  afterInit(server: Server) {
    console.log('Socket server initialized!');
  }

  handleConnection(@ConnectedSocket() client: any) {
    console.log(`Client connected: ${client.id}`);
    this.joinRoom(client.user.id, client);
  }

  handleDisconnect(@ConnectedSocket() client: any) {
    console.log(`Client disconnected: ${client.id}`);
    this.leaveRoom(client.user.id, client);
  }

  @SubscribeMessage('msgToServer')
  onEvent(@ConnectedSocket() client: any, @MessageBody() payload: any) {
    // process payload from client
  }

  joinRoom(roomId: string, client: any) {
    client.join(roomId);
    if (this.rooms[roomId]) {
      this.rooms[roomId].push(client);
    } else {
      this.rooms[roomId] = [client];
    }
  }

  leaveRoom(roomId: string, client: any) {
    client.leave(roomId);
    if (this.rooms[roomId]) {
      this.rooms[roomId] = this.rooms[roomId].filter((c) => c.id !== client.id);
      if (this.rooms[roomId].length === 0) {
        delete this.rooms[roomId];
      }
    }
  }

  broadcastMessage(payload: any) {
    this.server.emit('msgToClient', payload);
  }

  sendMessageToRoom(roomId: string, payload: any) {
    // Send message to room
    this.server.to(roomId).emit('msgToClient', payload);
  }
}
