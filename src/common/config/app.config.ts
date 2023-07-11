import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV,
  name: process.env.APP_NAME,
  version: process.env.APP_VERSION,
  workingDirectory: process.env.PWD || process.cwd(),
  frontendDomain: process.env.FRONTEND_DOMAIN,
  backendDomain: process.env.BACKEND_DOMAIN,
  port: +process.env.PORT || 5000,
  apiPrefix: process.env.API_PREFIX || 'api',
}));
