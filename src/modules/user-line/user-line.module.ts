import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserLineController } from './user-line.controller';
import { UserLineService } from './user-line.service';
import { UserLineEntity } from './entities/user-line.entity';

import { UserModule } from '../user/user.module';
import { LineModule } from '../line/line.module';

import { UserEntity } from '../user/entities/user.entity';
import { LineEntity } from '../line/entities/line.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserLineEntity, UserEntity, LineEntity]),
    UserModule,
    LineModule,
  ],
  controllers: [UserLineController],
  providers: [UserLineService],
  exports: [UserLineService],
})
export class UserLineModule {}
