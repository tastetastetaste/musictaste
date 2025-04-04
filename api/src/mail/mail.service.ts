import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { CreateReportDto } from 'shared';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(
    private mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async sendConfirmationEmail(email: string, name: string, url: string) {
    const isProduction =
      this.configService.get<string>('NODE_ENV') === 'production';

    if (!isProduction)
      return this.logger.log(
        `Send confirmation email to ${email} with url ${url}`,
      );

    return await this.mailerService.sendMail({
      to: email,
      subject: 'Confirmation Email',
      text: `
          Welcome To Music Taste!
          Hi ${name},
          Welcome To Music Taste!
          In order to confirm your registration please follow this link, or copy and paste the URL into your browser:
          ${url}
          If you received this email by mistake, just delete it.
          Music Taste
          `,
      html: `
          <div>
            <h2>Welcome To Music Taste!</h2>
            <strong>Hi ${name},</strong>
            <p>Welcome To Music Taste!</p>
            <p>In order to confirm your registration please follow this link, or copy and paste the URL into your browser:</p>
            <a href="${url}">${url}</a>
            <p>If you received this email by mistake, just delete it.</p>
            <strong>Music Taste</stron>
            </div>
            `,
    });
  }

  async sendForgotPasswordEmail(email: string, name: string, url: string) {
    const isProduction =
      this.configService.get<string>('NODE_ENV') === 'production';

    if (!isProduction)
      return this.logger.log(
        `Send forgot password email to ${email} with url ${url}`,
      );

    return await this.mailerService.sendMail({
      to: email,
      subject: 'Reset your password on Music Taste',
      text: `
          We got your request to change your password!
          Hi ${name},
          Welcome To Music Taste!
          In order to reset your password please follow this link, or copy and paste the URL into your browser:
          ${url}
          If you do not want to reset your password, you can ignore this email.
          Music Taste
          `,
      html: `
          <div>
            <h2>We got your request to change your password!</h2>
            <strong>Hi ${name},</strong>
            <p>In order to reset your password please follow this link, or copy and paste the URL into your browser:</p>
            <a href="${url}">${url}</a>
            <p>If you do not want to reset your password, you can ignore this email.</p>
            <strong>Music Taste</stron>
            </div>
            `,
    });
  }

  async sendReportEmail(report: CreateReportDto) {
    const isProduction =
      this.configService.get<string>('NODE_ENV') === 'production';

    const email = this.configService.get('REPORTS_EMAIL');

    if (!isProduction) return this.logger.log(`Send email to ${email}`);

    return await this.mailerService.sendMail({
      to: email,
      subject: `Report (${report.type}: ${report.id})`,
      text: report.reason,
      html: `
          <div>
            <p style="white-space: pre;">${report.reason}</p>
          </div>
          `,
    });
  }
}
