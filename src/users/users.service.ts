import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth/auth.service.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { serverResponse } from '../server-response.js';

@Injectable()
export class UsersService {
  constructor(private readonly authService: AuthService) {}

  findMe(userId: number) {
    return this.authService.getPublicUser(userId);
  }

  findAll() {
    return this.authService.getPublicUsers();
  }

  updateMe(userId: number, changes: UpdateUserDto) {
    return this.authService.updateUser(userId, changes);
  }

  getPoints(userId: number) {
    const user = this.authService.findUser(userId);
    return serverResponse({ points: user.points, notesCount: user.notesCount, averageRating: 0 }, 'Puntos del usuario encontrados exitosamente');
  }
}
