import { Body, Controller, Delete, Get, Put, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { UsersService } from './users.service.js';

interface AuthenticatedRequest {
  user: { id: number };
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

  @Delete()
  deleteMe(@Req() request: AuthenticatedRequest) {
    return this.usersService.deleteMe(request.user.id);
  }

  @Get('points')
  getPoints(@Req() request: AuthenticatedRequest) {
    return this.usersService.getPoints(request.user.id);
  }
}

@Controller('users')
@UseGuards(AuthGuard)
export class UsersListController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }
}
