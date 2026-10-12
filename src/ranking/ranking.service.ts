import { BadRequestException, Injectable } from '@nestjs/common';
import { AuthService } from '../auth/auth.service.js';
import { serverResponse } from '../server-response.js';

@Injectable()
export class RankingService {
  constructor(private readonly authService: AuthService) {}
  findTop(limit = 10) {
    if (!Number.isInteger(limit) || limit < 1 || limit > 100)
      throw new BadRequestException('limit debe ser un entero entre 1 y 100');
    return serverResponse(this.authService.getRanking(limit), 'Ranking encontrado exitosamente');
  }
}
