import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard.js';
import { NotesService } from './notes.service.js';
import { CreateNoteDto } from './dto/create-note.dto.js';
import { RateNoteDto } from './dto/rate-note.dto.js';

interface AuthenticatedRequest { user: { id: number }; }

@Controller('subjects/:subjectId/notes')
@UseGuards(AuthGuard)
export class SubjectNotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get()
  findBySubject(@Param('subjectId') subjectId: string, @Req() request: AuthenticatedRequest) {
    return this.notesService.findBySubject(subjectId, request.user.id);
  }

  @Post()
  create(
    @Param('subjectId') subjectId: string,
    @Req() request: AuthenticatedRequest,
    @Body() dto: CreateNoteDto,
  ) {
    return this.notesService.create(subjectId, request.user.id, dto);
  }
}

@Controller('notes')
@UseGuards(AuthGuard)
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get(':noteId/file')
  async getFile(@Param('noteId') id: string, @Req() request: AuthenticatedRequest) {
    const file = await this.notesService.getFile(id, request.user.id);
    const safeName = file.fileName.replace(/[\r\n"\\]/g, '_');
    return new StreamableFile(file.data, {
      type: 'application/pdf',
      disposition: `inline; filename="${safeName}"`,
    });
  }

  @Get(':noteId')
  findOne(@Param('noteId') id: string, @Req() request: AuthenticatedRequest) {
    return this.notesService.findOne(id, request.user.id);
  }

  @Put(':noteId')
  update(@Param('noteId') id: string, @Req() request: AuthenticatedRequest, @Body() dto: CreateNoteDto) {
    return this.notesService.update(id, request.user.id, dto);
  }

  @Delete(':noteId')
  remove(@Param('noteId') id: string, @Req() request: AuthenticatedRequest) {
    return this.notesService.remove(id, request.user.id);
  }

  @Post(':noteId/ratings')
  rate(@Param('noteId') id: string, @Req() request: AuthenticatedRequest, @Body() dto: RateNoteDto) {
    return this.notesService.rate(id, request.user.id, dto);
  }

  @Post(':noteId/bookmark')
  bookmark(@Param('noteId') id: string, @Req() request: AuthenticatedRequest) {
    return this.notesService.bookmark(id, request.user.id);
  }

  @Delete(':noteId/bookmark')
  unbookmark(@Param('noteId') id: string, @Req() request: AuthenticatedRequest) {
    return this.notesService.unbookmark(id, request.user.id);
  }
}

@Controller('users/me/bookmarks')
@UseGuards(AuthGuard)
export class BookmarksController {
  constructor(private readonly notesService: NotesService) {}

  @Get()
  findBookmarks(@Req() request: AuthenticatedRequest) {
    return this.notesService.findBookmarks(request.user.id);
  }
}
