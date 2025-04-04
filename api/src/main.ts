import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const domain = process.env.DOMAIN;

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: {
      credentials: true,
      origin:
        process.env.NODE_ENV === 'production'
          ? ['https://' + domain, 'https://www.' + domain]
          : ['http://localhost:4200'],
    },
  });

  process.env.NODE_ENV === 'production' && app.set('trust proxy', 1);

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  const config = new DocumentBuilder()
    .setTitle('Music Taste')
    .setDescription('Music rating')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document, {
    explorer: true,
  });

  const port = process.env.API_PORT || 4000;
  await app.listen(port);
  Logger.log(`🚀 Application is running on: http://localhost:${port}/`);
}

bootstrap();
