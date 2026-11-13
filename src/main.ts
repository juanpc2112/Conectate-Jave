import { NestFactory } from '@nestjs/core';
import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { json } from 'express';
import { AppModule } from './app.module.js';

@Catch()
class ServerErrorFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<{ status(code: number): { json(body: unknown): void } }>();
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const details = exception instanceof HttpException ? exception.getResponse() : null;
    const message = typeof details === 'object' && details !== null
      ? (details as { message?: string | string[] }).message
      : exception instanceof Error ? exception.message : 'Error interno del servidor';
    response.status(status).json({ data: null, status, message: Array.isArray(message) ? message.join(', ') : message ?? 'Error' });
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false });
  app.use(json({ limit: '14mb' }));
  app.setGlobalPrefix('api/v1');
  app.enableCors({
    origin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:3000',
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  });
  app.useGlobalFilters(new ServerErrorFilter());
  await app.listen(process.env.PORT ?? 3001);
}
await bootstrap();
