import { Injectable } from '@nestjs/common';
import { NotesService } from '../notes/notes.service.js';

@Injectable()
export class RankingService {
  constructor(private readonly notesService: NotesService) {}
  findTop(limit = 10) {
    return this.notesService.ranking(limit);
  }
}
