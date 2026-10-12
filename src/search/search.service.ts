import { BadRequestException, Injectable } from '@nestjs/common';
import { ChatsService } from '../chats/chats.service.js';
import { NotesService } from '../notes/notes.service.js';
import { SearchQueryDto } from './dto/search-query.dto.js';
import { serverResponse } from '../server-response.js';

@Injectable()
export class SearchService {
  constructor(
    private readonly chatsService: ChatsService,
    private readonly notesService: NotesService,
  ) {}
  search(dto: SearchQueryDto, userId: string) {
    const q = dto.q?.trim();
    const type = dto.type ?? 'all';
    if (!q) throw new BadRequestException('El parámetro q es obligatorio');
    if (!['chats', 'notes', 'all'].includes(type))
      throw new BadRequestException('type debe ser chats, notes o all');
    const term = q.toLocaleLowerCase();
    return serverResponse({
      chats:
        type === 'notes'
          ? []
          : this.chatsService
              .findAll().data
              .filter((chat) =>
                `${chat.subjectName} ${chat.professor}`
                  .toLocaleLowerCase()
                  .includes(term),
              ),
      notes: type === 'chats' ? [] : this.notesService.search(term, userId),
    }, 'Búsqueda realizada exitosamente');
  }
}
