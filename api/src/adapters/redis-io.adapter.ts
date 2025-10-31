import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { ConfigService } from '@nestjs/config';
import { createClient } from 'redis';

export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter>;
  private configService: ConfigService;

  constructor(app: any) {
    super(app);
    this.configService = app.get(ConfigService);
  }

  async connectToRedis(): Promise<void> {
    const redisOptions =
      this.configService.get('NODE_ENV') === 'production'
        ? {
            // redis[s]://[[username][:password]@][host][:port][/db-number]
            url: `redis://:${this.configService.get('REDIS_PASS')}@${this.configService.get('REDIS_HOST')}:${this.configService.get('REDIS_PORT')}`,
          }
        : {};

    const pubClient = createClient(redisOptions);
    const subClient = pubClient.duplicate();

    await Promise.all([pubClient.connect(), subClient.connect()]);

    this.adapterConstructor = createAdapter(pubClient, subClient);
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);
    server.adapter(this.adapterConstructor);
    return server;
  }
}
