import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard.js';
import { SubjectsService } from './subjects.service.js';

@Controller('subjects')
@UseGuards(AuthGuard)
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Get()
  findAll() {
    return this.subjectsService.findAll();
  }

  @Get(':subjectId')
  findOne(@Param('subjectId') subjectId: string) {
    return this.subjectsService.findOne(subjectId);
  }
}
