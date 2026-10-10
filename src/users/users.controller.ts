import { Body, Controller, Get, Put, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { UsersService } from './users.service.js';

interface AuthenticatedRequest {
  user: { id: string };
}

@Controller('users/me')
@UseGuards(AuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findMe(@Req() request: AuthenticatedRequest) {
    return this.usersService.findMe(request.user.id);
  }

  @Put()
  updateMe(
    @Req() request: AuthenticatedRequest,
    @Body() changes: UpdateUserDto,
  ) {
    return this.usersService.updateMe(request.user.id, changes);
  }

  @Get('points')
  getPoints(@Req() request: AuthenticatedRequest) {
    return this.usersService.getPoints(request.user.id);
  }
}
