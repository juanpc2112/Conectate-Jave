import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import {
  BookmarksController,
  NotesController,
  SubjectNotesController,
} from './notes.controller.js';
import { NotesService } from './notes.service.js';

@Module({
  imports: [AuthModule],
  controllers: [SubjectNotesController, NotesController, BookmarksController],
  providers: [NotesService],
  exports: [NotesService],
})
export class NotesModule {}
