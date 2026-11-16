import { BadRequestException, Injectable } from '@nestjs/common';
import { MessageQueryDto } from './dto/message-query.dto.js';
import { SendMessageDto } from './dto/send-message.dto.js';
import { SubjectsService } from '../subjects/subjects.service.js';
import { serverResponse } from '../server-response.js';

@Injectable()
export class ChatsService {
  constructor(private readonly subjectsService: SubjectsService) {}

  async findAll(userId: number) {
    const result = await this.subjectsService.findAll(userId);
    const chats = await Promise.all(result.data.map(async (subject) => {
      const record = await this.subjectsService.requireMember(subject.id, userId);
      const last = record.messages.at(-1);
      return {
        id: subject.id,
        subjectId: subject.id,
        subjectName: subject.name,
        professor: subject.professor,
        unreadCount: 0,
        lastMessage: last ? this.publicMessage(last) : null,
      };
    }));
    return serverResponse(chats, 'Chats encontrados exitosamente');
  }

  async findMessages(chatId: string, userId: number, query: MessageQueryDto) {
    const subject = await this.subjectsService.requireMember(chatId, userId);
    const page = query.page === undefined ? 1 : Number(query.page);
    const pageSize = query.pageSize === undefined ? 30 : Number(query.pageSize);
    if (!Number.isInteger(page) || page < 1 || !Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100) {
      throw new BadRequestException('page y pageSize deben ser enteros positivos (máximo 100)');
    }
    const messages = [...subject.messages]
      .reverse()
      .slice((page - 1) * pageSize, page * pageSize)
      .map((message) => this.publicMessage(message));
    return serverResponse(messages, 'Mensajes encontrados exitosamente');
  }

  async createMessage(chatId: string, userId: number, dto: SendMessageDto) {
    if (typeof dto?.text !== 'string' || !dto.text.trim()) {
      throw new BadRequestException('El texto del mensaje es obligatorio');
    }
    const message = await this.subjectsService.appendMessage(chatId, userId, dto.text);
    return serverResponse(this.publicMessage(message), 'Mensaje enviado exitosamente', 201);
  }

  private publicMessage(message: { id: string; senderId: number; senderRole: 'student' | 'professor'; text: string; sentAt: Date; read: boolean }) {
    return {
      id: message.id,
      senderId: String(message.senderId),
      senderRole: message.senderRole,
      text: message.text,
      sentAt: message.sentAt.toISOString(),
      read: message.read,
    };
  }
}
