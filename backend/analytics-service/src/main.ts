import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3005'],
    credentials: true,
  });
  await app.listen(3003);
  console.log('🚀 Analytics Service running at http://localhost:3003');
}

void bootstrap();
