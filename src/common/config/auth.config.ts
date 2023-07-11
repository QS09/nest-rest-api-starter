import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  secret: process.env.JWT_SECRET_KEY,
  accessTokenExpires: +process.env.ACCESS_TOKEN_EXPIRES_DAYS,
  refreshTokenExpires: +process.env.REFRESH_TOKEN_EXPIRES_DAYS,
}));
