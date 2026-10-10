import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard.js';
import { ChatsService } from './chats.service.js';
import { MessageQueryDto } from './dto/message-query.dto.js';
import { SendMessageDto } from './dto/send-message.dto.js';

interface AuthenticatedRequest {
  user: { id: string };
}

@Controller('chats')
@UseGuards(AuthGuard)
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}
  @Get() findAll() {
    return this.chatsService.findAll();
  }
  @Get(':chatId/messages') findMessages(
    @Param('chatId') chatId: string,
    @Query() query: MessageQueryDto,
  ) {
    return this.chatsService.findMessages(chatId, query);
  }
  @Post(':chatId/messages') createMessage(
    @Param('chatId') chatId: string,
    @Req() request: AuthenticatedRequest,
    @Body() dto: SendMessageDto,
  ) {
    return this.chatsService.createMessage(chatId, request.user.id, dto);
  }
}
