import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard.js';
import { AuthService } from '../auth/auth.service.js';
import { NotesService } from './notes.service.js';
import { CreateNoteDto } from './dto/create-note.dto.js';
import { RateNoteDto } from './dto/rate-note.dto.js';

interface AuthenticatedRequest {
  user: { id: string };
}

@Controller('subjects/:subjectId/notes')
@UseGuards(AuthGuard)
export class SubjectNotesController {
  constructor(
    private readonly notesService: NotesService,
    private readonly authService: AuthService,
  ) {}
  @Get() findBySubject(
    @Param('subjectId') subjectId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.notesService.findBySubject(subjectId, req.user.id);
  }
  @Post() create(
    @Param('subjectId') subjectId: string,
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateNoteDto,
  ) {
    return this.notesService.create(
      subjectId,
      req.user.id,
      this.authService.findUser(req.user.id).name,
      dto,
    );
  }
}

@Controller('notes')
@UseGuards(AuthGuard)
export class NotesController {
  constructor(private readonly notesService: NotesService) {}
  @Get(':noteId') findOne(
    @Param('noteId') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.notesService.findOne(id, req.user.id);
  }
  @Put(':noteId') update(
    @Param('noteId') id: string,
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateNoteDto,
  ) {
    return this.notesService.update(id, req.user.id, dto);
  }
  @Delete(':noteId') @HttpCode(HttpStatus.NO_CONTENT) remove(
    @Param('noteId') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    this.notesService.remove(id, req.user.id);
  }
  @Post(':noteId/ratings') rate(
    @Param('noteId') id: string,
    @Req() req: AuthenticatedRequest,
    @Body() dto: RateNoteDto,
  ) {
    return this.notesService.rate(id, req.user.id, dto);
  }
  @Post(':noteId/bookmark') @HttpCode(HttpStatus.NO_CONTENT) bookmark(
    @Param('noteId') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    this.notesService.bookmark(id, req.user.id);
  }
  @Delete(':noteId/bookmark') @HttpCode(HttpStatus.NO_CONTENT) unbookmark(
    @Param('noteId') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    this.notesService.unbookmark(id, req.user.id);
  }
}

@Controller('users/me/bookmarks')
@UseGuards(AuthGuard)
export class BookmarksController {
  constructor(private readonly notesService: NotesService) {}
  @Get() findBookmarks(@Req() req: AuthenticatedRequest) {
    return this.notesService.findBookmarks(req.user.id);
  }
}
