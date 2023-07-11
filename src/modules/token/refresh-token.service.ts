import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import * as moment from 'moment';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshTokenEntity } from './entities/refresh-token.entity';
import { TokenStatusEnum } from './token.types';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RefreshTokenService {
  constructor(
    @InjectRepository(RefreshTokenEntity)
    private refreshTokenRepo: Repository<RefreshTokenEntity>,
    private configService: ConfigService,
  ) {}

  /**
   * Create refresh token
   * @param decodedToken
   */
  async createToken(decodedToken: any) {
    const refreshTokenLifeTime = moment
      .unix(decodedToken.exp)
      .add(this.configService.get('auth.refreshTokenExpires'), 'd')
      .toDate();

    const refreshTokenId = randomBytes(64).toString('hex');

    await this.refreshTokenRepo.save(
      this.refreshTokenRepo.create({
        id: refreshTokenId,
        accessTokenId: decodedToken.jti,
        expiresAt: refreshTokenLifeTime,
      }),
    );

    return refreshTokenId;
  }

  /**
   * Revoke refresh token using JTI
   * @param jwtUniqueIdentifier
   */
  async revokeTokenUsingJti(jwtUniqueIdentifier: string) {
    const refreshToken = await this.refreshTokenRepo.findOne({
      where: { accessTokenId: jwtUniqueIdentifier },
    });
    refreshToken.revoked = TokenStatusEnum.REVOKED;
    await refreshToken.save();
  }

  /**
   * Revoke refresh token
   * @param id
   */
  async revokeTokenUsingRefreshToken(id: string) {
    const refreshToken = await this.refreshTokenRepo.findOne({
      where: { id: id },
    });
    refreshToken.revoked = TokenStatusEnum.REVOKED;
    await refreshToken.save();
  }

  /**
   * Validate refresh token
   * @param refreshToken
   */
  async validateRefreshToken(userId: string, refreshToken: string) {
    const token = await this.refreshTokenRepo
      .createQueryBuilder('rt')
      .leftJoin('access_tokens', 'act', 'act.id = rt.accessTokenId')
      .where('rt.id = :refreshToken', { refreshToken })
      .andWhere('rt.revoked != :revoked', { revoked: TokenStatusEnum.REVOKED })
      .andWhere('rt.expiresAt > :expiresAt', { expiresAt: new Date() })
      .andWhere('act.userId = :userId', { userId })
      .getOne();

    return !!token;
  }
}
