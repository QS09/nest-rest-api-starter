import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LineController } from './line.controller';
import { LineService } from './line.service';
import { LineEntity } from './entities/line.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LineEntity])],
  controllers: [LineController],
  providers: [LineService],
  exports: [LineService],
})
export class LineModule {}
