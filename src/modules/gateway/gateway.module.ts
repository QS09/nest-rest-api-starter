import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GatewayController } from './gateway.controller';

import { GatewayService } from './gateway.service';

import { MessageModule } from '../message/message.module';
import { LineModule } from '../line/line.module';
import { UserModule } from '../user/user.module';
import { EventModule } from '../event/event.module';

import { MessageEntity } from '../message/entities/message.entity';
import { LineEntity } from '../line/entities/line.entity';
import { UserEntity } from '../user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([MessageEntity, LineEntity, UserEntity]),
    MessageModule,
    LineModule,
    UserModule,
    EventModule,
  ],
  controllers: [GatewayController],
  providers: [GatewayService],
  exports: [GatewayService],
})
export class GatewayModule {}
