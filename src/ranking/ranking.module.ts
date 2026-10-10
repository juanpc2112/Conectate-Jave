import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { NotesModule } from '../notes/notes.module.js';
import { RankingController } from './ranking.controller.js';
import { RankingService } from './ranking.service.js';

@Module({
  imports: [AuthModule, NotesModule],
  controllers: [RankingController],
  providers: [RankingService],
})
export class RankingModule {}
