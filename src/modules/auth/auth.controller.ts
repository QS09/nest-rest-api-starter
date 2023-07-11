import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Request,
  UseGuards,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { instanceToPlain } from 'class-transformer';
import { AuthUser } from 'src/common/decorators/auth-user.decorators';
import { UserEntity } from '../user/entities/user.entity';
import { AuthService } from './auth.service';
import { RefreshTokenDto } from './dtos/refresh-token.dto';
import { LoginDto } from './dtos/login.dto';
import { ActivateDto } from './dtos/activate.dto';
import { RegisterDto } from './dtos/register.dto';
import { SocialAuthDto } from './dtos/social-auth.dto';
import { JwtAuthGuard } from './guards/jwt.guard';
import { LocalAuthGuard } from './guards/local.guard';
import { VerifyDto } from './dtos/verify.dto';

@Controller({
  path: 'auth',
})
@ApiTags('Auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * Verify user status with email
   */
  @Post('verify')
  @ApiBody({ type: VerifyDto })
  @ApiOperation({ summary: 'Verify user status' })
  async verify(@Body() verifyDto: VerifyDto) {
    const status = await this.authService.verifyUser(verifyDto);
    return { data: status };
  }

  /**
   * Login with email/password
   */
  @Post('login')
  @ApiBody({ type: LoginDto })
  @ApiOperation({ summary: 'Login' })
  @UseGuards(LocalAuthGuard)
  async login(@Request() req: any) {
    const token = await this.authService.generateTokens(req.user);
    return {
      data: { user: { ...instanceToPlain(req.user) }, token },
    };
  }

  /**
   * Register with email/password
   */
  @Post('register')
  @ApiOperation({ summary: 'Register' })
  async register(@Body() registerDto: RegisterDto) {
    const { user, token } = await this.authService.registerUser(registerDto);
    return {
      data: { user: { ...instanceToPlain(user) }, token },
    };
  }

  /**
   * Social Login
   */
  @Post('sso')
  @ApiOperation({ summary: 'Social auth' })
  async socialLogin(@Body() socialLoginDto: SocialAuthDto) {
    const { user, token } = await this.authService.socialAuth(socialLoginDto);
    return {
      data: { user: { ...instanceToPlain(user) }, token },
    };
  }

  /**
   * Activate with email/password, email must be exist as a pending user invited by admin
   */
  @Put(':user/activate')
  @ApiOperation({ summary: 'Activate' })
  async activate(
    @Param('user', ParseUUIDPipe) userId: string,
    @Body() activateDto: ActivateDto,
  ) {
    const { user, token } = await this.authService.activateUser(
      userId,
      activateDto,
    );
    return {
      data: { user: { ...instanceToPlain(user) }, token },
    };
  }

  /**
   * Generate Access & Refresh Token in exchange for a Refresh Token
   */
  @Post('refresh-token')
  @ApiOperation({
    summary: 'Refresh Token',
    description: 'Get access token from refresh token.',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async refreshToken(
    @AuthUser() authUser: UserEntity,
    @Body() refreshTokenDto: RefreshTokenDto,
  ) {
    const token = await this.authService.refreshToken(
      authUser,
      refreshTokenDto,
    );
    return { data: { token } };
  }

  /**
   * Logout
   */
  @Post('logout')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Logout' })
  async logOut(@AuthUser() authUser: UserEntity) {
    this.authService.logOut(authUser);
    return { message: 'User logged out successfully' };
  }

  /**
   * Get current user
   */
  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async profile(@AuthUser() authUser: UserEntity) {
    return { data: { ...instanceToPlain(authUser) } };
  }
}
