import * as crypto from 'crypto';
if (!globalThis.crypto) {
  (globalThis as any).crypto = crypto;
}

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { RedisIoAdapter } from './adapters/redis-io.adapter';
import { getCorsConfig } from './common/cors.config';

async function bootstrap() {
  const isProduction = process.env.NODE_ENV === 'production';

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: getCorsConfig(),
  });

  app.enableShutdownHooks();

  isProduction && app.set('trust proxy', 1);

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  // Redis adapter for WebSocket
  const redisIoAdapter = new RedisIoAdapter(app);
  await redisIoAdapter.connectToRedis();
  app.useWebSocketAdapter(redisIoAdapter);

  const config = new DocumentBuilder()
    .setTitle('MusicTaste')
    .setDescription('MusicTaste')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document, {
    explorer: true,
  });

  const port = process.env.API_PORT || 4000;
  await app.listen(port);

  if (process.send) {
    process.send('ready');
  }

  Logger.log(`🚀 Application is running on: http://localhost:${port}/`);
}

bootstrap();
