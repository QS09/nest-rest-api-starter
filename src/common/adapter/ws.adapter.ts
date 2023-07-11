/* eslint-disable @typescript-eslint/no-unused-vars */
import { INestApplicationContext } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Server } from 'socket.io';
import { AuthService } from 'src/modules/auth/auth.service';

export class AuthWsAdapter extends IoAdapter {
  private authService: AuthService;

  constructor(private app: INestApplicationContext) {
    super(app);
    app.resolve<AuthService>(AuthService).then((authService) => {
      this.authService = authService;
    });
  }

  createIOServer(port: number, options?: any) {
    const server: Server = super.createIOServer(port, options);

    server.use(async (socket: any, next) => {
      const authHeader = socket.handshake?.headers?.authorization;

      if (!authHeader) {
        next(new WsException('Unauthorized'));
      }

      const [method, token] = authHeader.split(' ');
      if (!token) {
        next(new WsException('Unauthorized'));
      }

      const user = await this.authService.validateToken(token);
      if (!user) {
        next(new WsException('Unauthorized'));
      }

      socket.user = user;
      next();
    });

    return server;
  }
}
