/* eslint-disable @typescript-eslint/no-unused-vars */
import { Socket } from 'socket.io';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const socket: Socket = context.switchToWs().getClient<Socket>();
      const authHeader = socket.handshake?.headers?.authorization;

      if (!authHeader) {
        return false;
      }

      const [method, token] = authHeader.split(' ');
      if (!token) {
        return false;
      }

      const user = await this.authService.validateToken(token);
      context.switchToHttp().getRequest().user = user;
      return Boolean(user);
    } catch (err) {
      throw new WsException(err.message);
    }
  }
}
