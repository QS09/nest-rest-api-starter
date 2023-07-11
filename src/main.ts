import { NestFactory } from '@nestjs/core';
import { AuthWsAdapter } from './common/adapter/ws.adapter';

import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import * as basicAuth from 'express-basic-auth';

import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false,
  });
  const configService = app.get(ConfigService);

  app.useStaticAssets(join(__dirname, '../', 'public'));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.enableCors();
  app.enableShutdownHooks();
  app.setGlobalPrefix(configService.get('app.apiPrefix'), {
    exclude: ['/'],
  });

  app.use(
    ['/docs', '/docs-json'],
    basicAuth({
      challenge: true,
      users: {
        apiDocAdmin: '100%Protected!',
      },
    }),
  );

  app.disable('x-powered-by');

  app.enableVersioning({
    type: VersioningType.URI,
  });

  const options = new DocumentBuilder()
    .setTitle('Cool API Documentation')
    .setDescription('Cool API documentation')
    .setVersion(configService.get('app.version'))
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('docs', app, document);

  app.useWebSocketAdapter(new AuthWsAdapter(app));
  await app.listen(configService.get('app.port'));
}

bootstrap();
