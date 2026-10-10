import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth/auth.service.js';
import { UpdateUserDto } from './dto/update-user.dto.js';

@Injectable()
export class UsersService {
  constructor(private readonly authService: AuthService) {}

  findMe(userId: string) {
    return this.authService.getPublicUser(userId);
  }

  updateMe(userId: string, changes: UpdateUserDto) {
    return this.authService.updateUser(userId, changes);
  }

  getPoints(userId: string) {
    const user = this.authService.findUser(userId);
    return { points: user.points, notesCount: user.notesCount, averageRating: 0 };
  }
}
