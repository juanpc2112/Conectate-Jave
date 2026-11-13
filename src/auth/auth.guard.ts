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
      headers: { authorization?: string };
      user?: { id: number };
    }>();
    const authorization = request.headers.authorization;
    const token = authorization?.startsWith('Bearer ')
      ? authorization.slice('Bearer '.length).trim()
      : '';
    if (!token) throw new UnauthorizedException('Se requiere un token de acceso');
    let id: number;
    try {
      id = await this.authService.verifyAccessToken(token);
    } catch {
      throw new UnauthorizedException('Token de acceso inválido o expirado');
    }
    request.user = { id };
    return true;
  }
}
