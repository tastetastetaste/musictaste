import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService {
  readonly client: RedisClientType;
  readonly forgotPasswordUserIdPrefix: string = 'forgotPassword:';
  readonly confirmEmailUserIdPrefix: string = 'confirmEmail:';
  readonly userSessionPrefix: string = 'sess:';
  readonly userSessionIdPrefix: string = 'sess:id:';

  constructor(private configService: ConfigService) {
    const redisOptions =
      this.configService.get('NODE_ENV') === 'production'
        ? {
            // redis[s]://[[username][:password]@][host][:port][/db-number]
            url: `redis://:${this.configService.get('REDIS_PASS')}@${this.configService.get('REDIS_HOST')}:${this.configService.get('REDIS_PORT')}`,
          }
        : {};

    this.client = createClient(redisOptions);

    this.client.connect().catch(console.error);
  }

  async setConfirmEmailUserId(key: string, userId: string) {
    return await this.client.set(
      `${this.confirmEmailUserIdPrefix}${key}`,
      userId,
      { EX: 60 * 60 * 24 },
    );
  }

  async getConfirmEmailUserId(key: string) {
    return (await this.client.get(
      `${this.confirmEmailUserIdPrefix}${key}`,
    )) as string;
  }

  async delConfirmEmailUserId(key: string) {
    return await this.client.del(`${this.confirmEmailUserIdPrefix}${key}`);
  }
  async setForgotPasswordUserId(key: string, userId: string) {
    return await this.client.set(
      `${this.forgotPasswordUserIdPrefix}${key}`,
      userId,
      { EX: 60 * 30 },
    );
  }

  async getForgotPasswordUserId(key: string) {
    return (await this.client.get(
      `${this.forgotPasswordUserIdPrefix}${key}`,
    )) as string;
  }
  async delForgotPasswordUserId(key: string) {
    return await this.client.del(`${this.forgotPasswordUserIdPrefix}${key}`);
  }

  async saveUserSessionId(userId: string, sessionId: string) {
    return await this.client.lPush(
      `${this.userSessionIdPrefix}${userId}`,
      sessionId,
    );
  }
  async removeUserSessions(userId: string) {
    const sessionKey = `${this.userSessionIdPrefix}${userId}`;
    const sessionIds = await this.client.lRange(sessionKey, 0, -1);

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

  async updateUserSessionsField(userId: string, field: string, value: any) {
    const sessionKey = `${this.userSessionIdPrefix}${userId}`;
    const sessionIds = await this.client.lRange(sessionKey, 0, -1);

    if (sessionIds.length === 0) {
      return;
    }

    const multi = this.client.multi();

    sessionIds.forEach((sessionId) => {
      const sessionDataKey = `${this.userSessionPrefix}${sessionId}`;
      // Get session data
      multi.get(sessionDataKey);
    });

    const results = await multi.exec();

    if (!results) return;

    const updateMulti = this.client.multi();

    sessionIds.forEach((sessionId, index) => {
      const sessionDataKey = `${this.userSessionPrefix}${sessionId}`;
      const sessionData = results[index] as unknown as string | null;

      if (sessionData) {
        try {
          const parsedSession = JSON.parse(sessionData);
          if (parsedSession?.passport?.user) {
            parsedSession.passport.user[field] = value;
            updateMulti.set(sessionDataKey, JSON.stringify(parsedSession));
          }
        } catch (error) {
          // Skip
        }
      }
    });

    await updateMulti.exec();
  }

  async updateUserSessionsUsername(userId: string, newUsername: string) {
    return this.updateUserSessionsField(userId, 'username', newUsername);
  }

  async updateUserSessionsContributorStatus(
    userId: string,
    newContributorStatus: number,
  ) {
    return this.updateUserSessionsField(
      userId,
      'contributorStatus',
      newContributorStatus,
    );
  }

  async updateUserSessionsAccountStatus(userId: string, newStatus: number) {
    return this.updateUserSessionsField(userId, 'accountStatus', newStatus);
  }

  async invalidateKeys(pattern: string) {
    const keysArray = [];

    for await (const keys of this.client.scanIterator({
      MATCH: pattern,
      COUNT: 100,
      TYPE: 'string',
    })) {
      keysArray.push(...keys);
    }

    const uniqueKeys = [...new Set(keysArray)];

    if (uniqueKeys.length > 0) {
      try {
        await this.client.unlink(uniqueKeys);
      } catch (error) {
        console.log('Failed to invalidate keys', error);
        return false;
      }
    }

    return true;
  }
}
