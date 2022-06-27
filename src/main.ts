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
  //app.use(helmet());
  //app.useGlobalPipes(new GraphQlValidation());
  // app.useGlobalPipes(
  //   new ValidationPipe({
  //     transform: true,
  //     exceptionFactory: (errors: ValidationError[]) => {
  //       return new UserInputError('VALIDATION_ERROR', {
  //         invalidArgs: errors,
  //       });
  //     },
  //   }),
  // );
  await app.listen(parseInt(process.env.PORT) || 3000);
}
bootstrap();
