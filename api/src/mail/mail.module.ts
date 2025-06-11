import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          transport: {
            host: configService.get('EMAIL_HOST'),
            port: Number(configService.get('EMAIL_PORT')),
            secure: false,
            auth: {
              user: configService.get('EMAIL_USER'),
              pass: configService.get('EMAIL_PASS'),
            },
          },
          defaults: {
            from: '"MusicTaste" ' + configService.get('EMAIL_USER'),
            headers: {
              'X-Priority': '1',
              Precedence: 'transactional',
              'List-Unsubscribe': `<mailto:${configService.get('EMAIL_USER')}>`,
            },
          },
        };
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
