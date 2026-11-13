import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { MongooseModule } from '@nestjs/mongoose';
import { Note, NoteSchema } from './schemas/note.schema.js';
import { SubjectsModule } from '../subjects/subjects.module.js';
import {
  BookmarksController,
  NotesController,
  SubjectNotesController,
} from './notes.controller.js';
import { NotesService } from './notes.service.js';

@Module({
  imports: [AuthModule, SubjectsModule, MongooseModule.forFeature([{ name: Note.name, schema: NoteSchema }])],
  controllers: [SubjectNotesController, NotesController, BookmarksController],
  providers: [NotesService],
  exports: [NotesService],
})
export class NotesModule {}
