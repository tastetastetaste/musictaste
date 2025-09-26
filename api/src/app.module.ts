import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import connectRedis from 'connect-redis';
import session from 'express-session';
import passport from 'passport';
import { dataSourceOptions } from '../db/data-source';
import { ArtistsModule } from './artists/artists.module';
import { AuthModule } from './auth/auth.module';
import { AutofillModule } from './autofill/autofill.module';
import { EntriesModule } from './entries/entries.module';
import { GenresModule } from './genres/genres.module';
import { ImagesModule } from './images/images.module';
import { LabelsModule } from './labels/labels.module';
import { ListsModule } from './lists/lists.module';
import { MailModule } from './mail/mail.module';
import { RedisModule } from './redis/redis.module';
import { RedisService } from './redis/redis.service';
import { ReleasesModule } from './releases/releases.module';
import { SearchModule } from './search/search.module';
import { SubmissionModule } from './submission/submission.module';
import { UsersModule } from './users/users.module';
import { LanguagesModule } from './languages/languages.module';
import { ReportsModule } from './reports/reports.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import Redis from 'ioredis';
import { APP_GUARD } from '@nestjs/core';
import { AdminModule } from './admin/admin.module';
import { CommentsModule } from './comments/comments.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        ({
          ...dataSourceOptions,
          host: configService.get('DB_HOST'),
          port: configService.get('DB_PORT'),
          username: configService.get('DB_USERNAME'),
          password: configService.get('DB_PASSWORD'),
          database: configService.get('DB_NAME'),
        }) as TypeOrmModuleOptions,
    }),
    RedisModule.forRootAsync({
      useFactory: async (
        configService: ConfigService,
      ): Promise<ConfigService> => {
        return configService;
      },
      inject: [ConfigService],
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          {
            ttl: 1000 * 60,
            limit: 50,
          },
        ],
        errorMessage: 'Rate limit exceeded. Please try again later.',
        storage: new ThrottlerStorageRedisService(
          configService.get('NODE_ENV') === 'production'
            ? new Redis({
                host: configService.get('REDIS_HOST'),
                port: configService.get('REDIS_PORT'),
                password: configService.get('REDIS_PASS'),
              })
            : new Redis(),
        ),
      }),
    }),
    UsersModule,
    ReleasesModule,
    AuthModule,
    ArtistsModule,
    GenresModule,
    LabelsModule,
    ListsModule,
    EntriesModule,
    MailModule,
    SearchModule,
    ImagesModule,
    SubmissionModule,
    AutofillModule,
    LanguagesModule,
    ReportsModule,
    AdminModule,
    CommentsModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  constructor(
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {}
  configure(consumer: MiddlewareConsumer) {
    const RedisStore = connectRedis(session);

    consumer
      .apply(
        session({
          store: new RedisStore({
            client: this.redisService.client,
            prefix: this.redisService.userSessionPrefix,
            logErrors: true,
          }),
          name: 'sid',
          secret: this.configService.get('SESSION_SECRET'),
          resave: false,
          saveUninitialized: false,
          cookie: {
            httpOnly: true,
            secure: this.configService.get('NODE_ENV') === 'production',
            maxAge: 1000 * 60 * 60 * 24 * 360, // 360 days
            domain:
              this.configService.get('NODE_ENV') === 'production'
                ? '.' + this.configService.get('DOMAIN')
                : undefined,
          },
        }),
        passport.initialize(),
        passport.session(),
      )
      .forRoutes('*');
  }
}
