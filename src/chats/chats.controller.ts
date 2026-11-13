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

interface AuthenticatedRequest { user: { id: number }; }

@Controller('chats')
@UseGuards(AuthGuard)
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Get()
  findAll(@Req() request: AuthenticatedRequest) {
    return this.chatsService.findAll(request.user.id);
  }

  @Get(':chatId/messages')
  findMessages(
    @Param('chatId') chatId: string,
    @Req() request: AuthenticatedRequest,
    @Query() query: MessageQueryDto,
  ) {
    return this.chatsService.findMessages(chatId, request.user.id, query);
  }

  @Post(':chatId/messages')
  createMessage(
    @Param('chatId') chatId: string,
    @Req() request: AuthenticatedRequest,
    @Body() dto: SendMessageDto,
  ) {
    return this.chatsService.createMessage(chatId, request.user.id, dto);
  }
}
