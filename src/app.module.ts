import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { SubjectsModule } from './subjects/subjects.module.js';
import { UsersModule } from './users/users.module.js';
import { ChatsModule } from './chats/chats.module.js';
import { NotesModule } from './notes/notes.module.js';
import { RankingModule } from './ranking/ranking.module.js';
import { SearchModule } from './search/search.module.js';
import { SettingsModule } from './settings/settings.module.js';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    SubjectsModule,
    ChatsModule,
    NotesModule,
    RankingModule,
    SearchModule,
    SettingsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
