import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/modules/user/user.service';
import { AccessTokenService } from 'src/modules/token/access-token.service';
import { TokenStatusEnum } from 'src/modules/token/token.types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private userService: UserService,
    private accessTokenService: AccessTokenService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET_KEY'),
    });
  }

  async validate(payload: any) {
    const accessToken = await this.accessTokenService.findOne(payload.jti);

    if (
      !accessToken ||
      accessToken.revoked === TokenStatusEnum.REVOKED ||
      Date.now() > accessToken.expiresAt.getTime()
    ) {
      throw new UnauthorizedException();
    }

    const user = await this.userService.findByEmail(payload.username);
    if (!user) throw new UnauthorizedException();

    user.jti = payload.jti;
    return user;
  }
}
