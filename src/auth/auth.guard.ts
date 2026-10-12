import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service.js';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      headers: { 'x-user-id'?: string };
      user?: { id: number };
    }>();
    const id = Number(request.headers['x-user-id']);
    if (!Number.isInteger(id) || id < 1) {
      throw new UnauthorizedException('Se requiere el encabezado x-user-id con el ID del usuario');
    }
    await this.authService.findUser(id);
    request.user = { id };
    return true;
  }
}
