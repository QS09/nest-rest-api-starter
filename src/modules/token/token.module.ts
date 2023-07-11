import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { AccessTokenService } from './access-token.service';
import { RefreshTokenService } from './refresh-token.service';

import { TokenController } from './token.controller';
import { AccessTokenEntity } from './entities/access-token.entity';
import { RefreshTokenEntity } from './entities/refresh-token.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AccessTokenEntity, RefreshTokenEntity]),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('auth.secret'),
        signOptions: {
          expiresIn: `${
            configService.get('auth.accessTokenExpires') || 7
          } days`,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AccessTokenService, RefreshTokenService],
  exports: [AccessTokenService, RefreshTokenService],
  controllers: [TokenController],
})
export class TokenModule {}
