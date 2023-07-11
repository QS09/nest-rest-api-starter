import * as moment from 'moment';
import { randomBytes } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccessTokenEntity } from './entities/access-token.entity';
import { UserEntity } from '../user/entities/user.entity';
import { TokenStatusEnum } from './token.types';

@Injectable()
export class AccessTokenService {
  constructor(
    @InjectRepository(AccessTokenEntity)
    private accessTokenRepo: Repository<AccessTokenEntity>,
    private jwtService: JwtService,
  ) {}

  /**
   * Find one
   * @param id
   */
  findOne(id: any) {
    return this.accessTokenRepo.findOne({ where: { id } });
  }

  /**
   * Create access token
   * @param decodedJwtToken
   * @param user
   */
  async createToken(user: UserEntity) {
    const jwtToken = this.jwtService.sign({
      username: user.email,
      sub: user.id,
      jti: randomBytes(32).toString('hex'),
    });

    const decodedToken = this.jwtService.decode(jwtToken);

    const createdAt = moment.unix(decodedToken['iat']).toDate();
    const expiresAt = moment.unix(decodedToken['exp']).toDate();

    const accessToken = this.accessTokenRepo.create({
      id: decodedToken['jti'],
      expiresAt,
      createdAt,
      user,
    });

    await this.accessTokenRepo.save(accessToken);
    return { accessToken, jwtToken, decodedToken };
  }

  /**
   * Revoke access token using Jwt Unique Identifier
   * @param jwtUniqueIdentifier
   */
  async revokeToken(jwtUniqueIdentifier: string) {
    await this.accessTokenRepo.save(
      this.accessTokenRepo.create({
        id: jwtUniqueIdentifier,
        revoked: TokenStatusEnum.REVOKED,
      }),
    );
  }

  /**
   * Revoke access token using refresh token
   * @param refreshToken
   */
  async revokeTokenUsingRefreshToken(refreshToken: string) {
    const token = await this.accessTokenRepo
      .createQueryBuilder('act')
      .leftJoin('refresh_tokens', 'rt', 'act.id = rt.accessTokenId')
      .where('rt.id = :refreshToken', { refreshToken })
      .getOne();

    token.revoked = TokenStatusEnum.REVOKED;
    await token.save();
  }

  /**
   * Revoke all access tokens of a user
   * @param userId
   */
  async revokeAllTokens(userId: number, jti: string) {
    await this.accessTokenRepo
      .createQueryBuilder()
      .update({ revoked: TokenStatusEnum.REVOKED })
      .where({ userId })
      .andWhere('id != :jti', { jti })
      .execute();
  }

  /**
   * Check JWT Token validity
   * @param jwtToken
   * @return boolean
   */
  async hasTokenExpired(jwtToken: any) {
    const accessToken = await this.accessTokenRepo.findOne(jwtToken['jti']);

    return !accessToken ||
      accessToken.revoked == TokenStatusEnum.REVOKED ||
      accessToken.expiresAt < new Date()
      ? true
      : false;
  }
}
