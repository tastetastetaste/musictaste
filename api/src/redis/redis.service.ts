import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  readonly client: Redis;
  readonly forgotPasswordUserIdPrefix: string = 'forgotPassword:';
  readonly confirmEmailUserIdPrefix: string = 'confirmEmail:';
  readonly userSessionPrefix: string = 'sess:';
  readonly userSessionIdPrefix: string = 'sess:id:';

  constructor(private configService: ConfigService) {
    this.client =
      this.configService.get('NODE_ENV') === 'production'
        ? new Redis({
            host: this.configService.get('REDIS_HOST'),
            port: this.configService.get('REDIS_PORT'),
            password: this.configService.get('REDIS_PASS'),
          })
        : new Redis();
  }

  async setConfirmEmailUserId(key: string, userId: string) {
    return await this.client.set(
      `${this.confirmEmailUserIdPrefix}${key}`,
      userId,
      'EX',
      60 * 60 * 24,
    );
  }

  async getConfirmEmailUserId(key: string) {
    return await this.client.get(`${this.confirmEmailUserIdPrefix}${key}`);
  }

  async delConfirmEmailUserId(key: string) {
    return await this.client.del(`${this.confirmEmailUserIdPrefix}${key}`);
  }
  async setForgotPasswordUserId(key: string, userId: string) {
    return await this.client.set(
      `${this.forgotPasswordUserIdPrefix}${key}`,
      userId,
      'EX',
      60 * 30,
    );
  }

  async getForgotPasswordUserId(key: string) {
    return await this.client.get(`${this.forgotPasswordUserIdPrefix}${key}`);
  }
  async delForgotPasswordUserId(key: string) {
    return await this.client.del(`${this.forgotPasswordUserIdPrefix}${key}`);
  }

  async saveUserSessionId(userId: string, sessionId: string) {
    return await this.client.lpush(
      `${this.userSessionIdPrefix}${userId}`,
      sessionId,
    );
  }
  async removeUserSessions(userId: string) {
    const sessionKey = `${this.userSessionIdPrefix}${userId}`;
    const sessionIds = await this.client.lrange(sessionKey, 0, -1);

    if (sessionIds.length === 0) {
      return;
    }

    const multi = this.client.multi();

    sessionIds.forEach((sessionId) => {
      multi.del(`${this.userSessionPrefix}${sessionId}`);
    });

    multi.del(sessionKey);

    await multi.exec();
  }
}
