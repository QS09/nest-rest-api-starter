import {
  Module,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
} from '@nestjs/common';
import { join } from 'path';

import AdminJS from 'adminjs';
import { AdminModule } from '@adminjs/nestjs';
import { Database, Resource } from '@adminjs/typeorm';

import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { MailerModule, MailerOptions } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

import { JsonBodyMiddleware } from './common/middleware/json-body.middleware';
import { RawBodyMiddleware } from './common/middleware/raw-body.middleware';

import databaseConfig from './common/config/database.config';
import authConfig from './common/config/auth.config';
import appConfig from './common/config/app.config';
import mailConfig from './common/config/mail.config';
import storageConfig from './common/config/storage.config';
import googleConfig from './common/config/google.config';

import { HomeModule } from './modules/home/home.module';
import { AuthModule } from './modules/auth/auth.module';
import { TokenModule } from './modules/token/token.module';
import { UserModule } from './modules/user/user.module';
import { LineModule } from './modules/line/line.module';
import { UserLineModule } from './modules/user-line/user-line.module';
import { MessageModule } from './modules/message/message.module';
import { GatewayModule } from './modules/gateway/gateway.module';
import { EventModule } from './modules/event/event.module';

import { UserEntity } from './modules/user/entities/user.entity';
import { LineEntity } from './modules/line/entities/line.entity';
import { UserLineEntity } from './modules/user-line/entities/user-line.entity';
import { MessageEntity } from './modules/message/entities/message.entity';

AdminJS.registerAdapter({ Database, Resource });

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        databaseConfig,
        authConfig,
        appConfig,
        mailConfig,
        storageConfig,
        googleConfig,
      ],
      envFilePath: ['.env'],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) =>
        ({
          type: configService.get('database.type'),
          url: configService.get('database.url'),
          host: configService.get('database.host'),
          port: configService.get('database.port'),
          username: configService.get('database.username'),
          password: configService.get('database.password'),
          database: configService.get('database.name'),
          synchronize: configService.get('database.synchronize'),
          dropSchema: false,
          keepConnectionAlive: true,
          logging: configService.get('app.nodeEnv') !== 'production',
          entities: [join(__dirname, 'modules', '**/*.entity{.ts,.js}')],
          migrations: [join(__dirname, 'database', 'migrations/**/*{.ts,.js}')],
          autoLoadEntities: true,
          cli: {
            entitiesDir: 'src/modules',
            migrationsDir: 'src/database/migrations',
            subscribersDir: 'subscriber',
          },
          extra: {
            // based on https://node-postgres.com/api/pool
            // max connection pool size
            max: configService.get('database.maxConnections'),
            ssl: configService.get('database.sslEnabled')
              ? {
                  rejectUnauthorized: configService.get(
                    'database.rejectUnauthorized',
                  ),
                  ca: configService.get('database.ca') ?? undefined,
                  key: configService.get('database.key') ?? undefined,
                  cert: configService.get('database.cert') ?? undefined,
                }
              : undefined,
          },
        } as TypeOrmModuleOptions),
      inject: [ConfigService],
    }),
    MailerModule.forRootAsync({
      useFactory: (configService: ConfigService) =>
        ({
          transport: {
            host: configService.get('mail.host'),
            port: configService.get('mail.port'),
            ignoreTLS: configService.get('mail.ignoreTLS'),
            secure: configService.get('mail.secure'),
            requireTLS: configService.get('mail.requireTLS'),
            auth: {
              user: configService.get('mail.user'),
              pass: configService.get('mail.password'),
            },
          },
          defaults: {
            from: `"${configService.get(
              'mail.defaultName',
            )}" <${configService.get('mail.defaultEmail')}>`,
          },
          template: {
            dir: join(
              configService.get('app.workingDirectory'),
              'src',
              'views',
              'email-templates',
            ),
            adapter: new HandlebarsAdapter(),
            options: {
              strict: true,
            },
          },
        } as MailerOptions),
      inject: [ConfigService],
    }),
    AdminModule.createAdmin({
      adminJsOptions: {
        rootPath: '/admin',
        resources: [UserEntity, LineEntity, UserLineEntity, MessageEntity],
      },
      auth: {
        authenticate: async (email, password) => {
          if (email === 'admin@cool.org' && password === 'P@33w0rd') {
            return Promise.resolve({ email, password });
          }
          return null;
        },
        cookieName: 'admin',
        cookiePassword: '@dminP@55',
      },
    }),
    HomeModule,
    AuthModule,
    TokenModule,
    UserModule,
    LineModule,
    UserLineModule,
    MessageModule,
    GatewayModule,
    EventModule,
  ],
  exports: [
    AdminModule,
    HomeModule,
    AuthModule,
    TokenModule,
    UserModule,
    LineModule,
    UserLineModule,
    MessageModule,
    GatewayModule,
    EventModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  public configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(RawBodyMiddleware)
      .forRoutes({
        path: '/gateway/message',
        method: RequestMethod.POST,
      })
      .apply(JsonBodyMiddleware)
      .forRoutes('*');
  }
}
