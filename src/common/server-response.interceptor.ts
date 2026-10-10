import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { ServerResponse } from './server-response.js';

@Injectable()
export class ServerResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const response = context.switchToHttp().getResponse<{
      statusCode: number;
      status(code: number): void;
    }>();

    return next.handle().pipe(
      map((result: unknown) => {
        if (result instanceof ServerResponse) {
          if (result.status !== response.statusCode) {
            response.status(result.status);
          }
          return result;
        }

        return new ServerResponse(
          result,
          response.statusCode,
          'Solicitud procesada correctamente',
        );
      }),
    );
  }
}
