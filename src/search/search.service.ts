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

  async search(dto: SearchQueryDto, userId: number) {
    const query = dto.q?.trim();
    const type = dto.type ?? 'all';
    if (!query) throw new BadRequestException('El parámetro q es obligatorio');
    if (!['chats', 'notes', 'all'].includes(type)) {
      throw new BadRequestException('type debe ser chats, notes o all');
    }
    const term = query.toLocaleLowerCase();
    const chatsResult = type === 'notes' ? null : await this.chatsService.findAll(userId);
    const notes = type === 'chats' ? [] : await this.notesService.search(term, userId);
    return serverResponse({
      chats: chatsResult?.data.filter((chat) =>
        `${chat.subjectName} ${chat.professor}`.toLocaleLowerCase().includes(term),
      ) ?? [],
      notes,
    }, 'Búsqueda realizada exitosamente');
  }
}
