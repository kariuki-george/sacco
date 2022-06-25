import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { GraphQlValidation } from 'lib/validator.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  //app.enableCors();
  //app.use(helmet());
  app.useGlobalPipes(new GraphQlValidation());

  await app.listen(parseInt(process.env.PORT) || 3000);
}
bootstrap();
