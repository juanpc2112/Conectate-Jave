import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { AllExceptionsFilter } from './common/all-exceptions.filter.js';
import { ServerResponseInterceptor } from './common/server-response.interceptor.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  app.useGlobalInterceptors(new ServerResponseInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
