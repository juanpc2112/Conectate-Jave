import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ServerResponse } from './server-response.js';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<{
      status(code: number): { json(body: unknown): void };
      json(body: unknown): void;
    }>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null;
    const message =
      typeof exceptionResponse === 'object' && exceptionResponse !== null
        ? (exceptionResponse as { message?: string | string[] }).message
        : exception instanceof Error
          ? exception.message
          : 'Error interno del servidor';

    response.status(status).json(
      new ServerResponse(
        null,
        status,
        Array.isArray(message) ? message.join(', ') : (message ?? 'Error'),
      ),
    );
  }
}
