import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { SubjectsModule } from '../subjects/subjects.module.js';
import { ChatsController } from './chats.controller.js';
import { ChatsService } from './chats.service.js';

@Module({
  imports: [AuthModule, SubjectsModule],
  controllers: [ChatsController],
  providers: [ChatsService],
  exports: [ChatsService],
})
export class ChatsModule {}
