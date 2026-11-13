import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard.js';
import { SubjectsService } from './subjects.service.js';

interface AuthenticatedRequest { user: { id: number }; }
class CreateSubjectBody { name!: string; }
class JoinSubjectBody { code!: string; }

@Controller('subjects')
@UseGuards(AuthGuard)
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Get()
  findAll(@Req() request: AuthenticatedRequest) {
    return this.subjectsService.findAll(request.user.id);
  }

  @Get(':subjectId')
  findOne(@Param('subjectId') subjectId: string, @Req() request: AuthenticatedRequest) {
    return this.subjectsService.findOne(subjectId, request.user.id);
  }

  @Post()
  create(@Req() request: AuthenticatedRequest, @Body() body: CreateSubjectBody) {
    return this.subjectsService.create(request.user.id, body.name);
  }

  @Post('join')
  join(@Req() request: AuthenticatedRequest, @Body() body: JoinSubjectBody) {
    return this.subjectsService.join(request.user.id, body.code);
  }
}
