import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { UserStatusEnum } from 'src/modules/user/user.types';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
    });
  }

  async validate(username: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(username, password);

    if (!user) throw new UnauthorizedException();

    if (
      !user.deleted ||
      user.status === UserStatusEnum.ACTIVE ||
      user.status === UserStatusEnum.SUSPENDED
    ) {
      return user;
    }

    throw new UnauthorizedException('Active account not found');
  }
}
