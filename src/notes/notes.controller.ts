import {
  Body,
  Controller,
  Delete,
  Get,
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
  user: { id: number };
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
    return this.notesService.findBySubject(subjectId, String(req.user.id));
  }
  @Post() create(
    @Param('subjectId') subjectId: string,
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateNoteDto,
  ) {
    return this.notesService.create(
      subjectId,
      String(req.user.id),
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
    return this.notesService.findOne(id, String(req.user.id));
  }
  @Put(':noteId') update(
    @Param('noteId') id: string,
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateNoteDto,
  ) {
    return this.notesService.update(id, String(req.user.id), dto);
  }
  @Delete(':noteId') remove(
    @Param('noteId') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    this.notesService.remove(id, String(req.user.id));
  }
  @Post(':noteId/ratings') rate(
    @Param('noteId') id: string,
    @Req() req: AuthenticatedRequest,
    @Body() dto: RateNoteDto,
  ) {
    return this.notesService.rate(id, String(req.user.id), dto);
  }
  @Post(':noteId/bookmark') bookmark(
    @Param('noteId') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    this.notesService.bookmark(id, String(req.user.id));
  }
  @Delete(':noteId/bookmark') unbookmark(
    @Param('noteId') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    this.notesService.unbookmark(id, String(req.user.id));
  }
}

@Controller('users/me/bookmarks')
@UseGuards(AuthGuard)
export class BookmarksController {
  constructor(private readonly notesService: NotesService) {}
  @Get() findBookmarks(@Req() req: AuthenticatedRequest) {
    return this.notesService.findBookmarks(String(req.user.id));
  }
}
