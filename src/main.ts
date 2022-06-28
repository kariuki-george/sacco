import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { GraphQlValidation } from 'src/lib/validator.pipe';
import { ValidationError, ValidationPipe } from '@nestjs/common';
import { error } from 'console';
import { UserInputError } from 'apollo-server-express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  await app.listen(parseInt(process.env.PORT) || 3000);
}
bootstrap();
