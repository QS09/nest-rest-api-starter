import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AccessTokenService } from 'src/modules/token/access-token.service';
import { RefreshTokenService } from 'src/modules/token/refresh-token.service';
import { UserService } from 'src/modules/user/user.service';

import { UserEntity } from 'src/modules/user/entities/user.entity';
import { RefreshTokenDto } from './dtos/refresh-token.dto';
import { RegisterDto } from './dtos/register.dto';
import { SocialAuthDto } from './dtos/social-auth.dto';
import { ActivateDto } from './dtos/activate.dto';
import { SocialStrategy } from './strategies/social.strategy';
import { SocialUserType } from './auth.types';
import { VerifyDto } from './dtos/verify.dto';
import { UserStatusEnum } from '../user/user.types';
import { ForbiddenException } from '@nestjs/common/exceptions';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
    private accessTokenService: AccessTokenService,
    private refreshTokenService: RefreshTokenService,
  ) {}

  /**
   * Generate Access & Refresh Token for a user
   */
  async generateTokens(user: any) {
    const { decodedToken, jwtToken } =
      await this.accessTokenService.createToken(user);

    const refreshToken = await this.refreshTokenService.createToken(
      decodedToken,
    );

    return {
      accessToken: jwtToken,
      refreshToken,
      expiresAt: decodedToken['exp'],
    };
  }

  /**
   * Generate Access & Refresh Token in exchange for a Refresh Token
   */
  async refreshToken(authUser: UserEntity, data: RefreshTokenDto) {
    const isTokenValid = await this.refreshTokenService.validateRefreshToken(
      authUser.id,
      data.refreshToken,
    );

    if (!isTokenValid)
      throw new BadRequestException(
        'Provided token is either invalid or expired',
      );

    // revoke both tokens
    await Promise.all([
      this.accessTokenService.revokeTokenUsingRefreshToken(data.refreshToken),
      this.refreshTokenService.revokeTokenUsingRefreshToken(data.refreshToken),
    ]);

    return this.generateTokens(authUser);
  }

  /**
   * Logout
   */
  logOut(authUser: UserEntity): void {
    Promise.all([
      this.accessTokenService.revokeToken(authUser.jti),
      this.refreshTokenService.revokeTokenUsingJti(authUser.jti),
    ]);
  }

  /**
   * Validate user
   * Password validation
   */
  async validateUser(
    username: string,
    password: string,
  ): Promise<UserEntity | null> {
    const user = await this.userService.findByEmail(username);

    const isValid =
      user && user.password && (await user.validatePassword(password));

    return isValid ? user : null;
  }

  /**
   * Validate token
   * Token validation
   */
  async validateToken(token: string): Promise<UserEntity | null> {
    const decoded: any = this.jwtService.decode(token);
    const { username } = decoded;
    const user = await this.userService.findByEmail(username);
    return user.status === UserStatusEnum.ACTIVE && !user.deleted ? user : null;
  }

  /**
   * Validate social user
   */
  async validateSocialUser(
    data: SocialAuthDto,
  ): Promise<SocialUserType | null> {
    const socialStrategy = new SocialStrategy(data.provider, data.code);
    return socialStrategy.validate();
  }

  /**
   * Validate and return access & refresh token for a social user, create account if not exist
   */
  async socialAuth(data: SocialAuthDto) {
    const socialUser = await this.validateSocialUser(data);

    if (!socialUser) throw new UnauthorizedException();

    const user = await this.userService.findByEmail(socialUser.email);

    // user Already registered with email
    // TODO: Add provider and provider id in user meta providers
    if (user) {
      throw new UnauthorizedException(
        'Account already exists with this email address',
      );
    }

    // Register user if not exist
    if (!user) {
      const newUser = await this.userService.register({
        ...socialUser,
        status: UserStatusEnum.ACTIVE,
      });

      const authenticate = await this.generateTokens(newUser);
      return { user: newUser, authenticate };
    }

    const token = await this.generateTokens(user);
    return { user, token };
  }

  /**
   * Register user
   */
  async registerUser(registerDto: RegisterDto) {
    const user = await this.userService.findByEmail(registerDto.email);

    if (user)
      throw new ConflictException('Account with this email already exists');

    const newUser = await this.userService.register({
      ...registerDto,
      status: UserStatusEnum.ACTIVE,
    });
    const token = await this.generateTokens(newUser);

    return { user: newUser, token };
  }

  /**
   * Activate user
   */
  async activateUser(userId: string, activateDto: ActivateDto) {
    const user = await this.userService.update(userId, {
      ...activateDto,
      status: UserStatusEnum.ACTIVE,
    });
    const token = await this.generateTokens(user);
    return { user, token };
  }

  /**
   * Verify user, get user status
   */
  async verifyUser(verifyDto: VerifyDto) {
    const user = await this.userService.findByEmail(verifyDto.email);
    if (!user) {
      throw new NotFoundException(
        'Account associated with the email not found',
      );
    }

    if (user.deleted || user.status === UserStatusEnum.BLOCKED) {
      throw new ForbiddenException(
        'Account blocked. Please contact admin to restore your account',
      );
    }
    let redirect = '';
    if (
      user.status === UserStatusEnum.ACTIVE ||
      user.status === UserStatusEnum.SUSPENDED
    ) {
      redirect = 'login';
    } else {
      redirect = 'register';
    }
    return {
      email: user.email,
      redirect,
    };
  }
}
