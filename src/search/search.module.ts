import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { ChatsModule } from '../chats/chats.module.js';
import { NotesModule } from '../notes/notes.module.js';
import { SearchController } from './search.controller.js';
import { SearchService } from './search.service.js';

@Module({
  imports: [AuthModule, ChatsModule, NotesModule],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}
