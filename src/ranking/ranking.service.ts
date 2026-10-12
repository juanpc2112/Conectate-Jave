import { Injectable } from '@nestjs/common';
import { NotesService } from '../notes/notes.service.js';
import { serverResponse } from '../server-response.js';

@Injectable()
export class RankingService {
  constructor(private readonly notesService: NotesService) {}
  findTop(limit = 10) {
    return serverResponse(this.notesService.ranking(limit), 'Ranking encontrado exitosamente');
  }
}
