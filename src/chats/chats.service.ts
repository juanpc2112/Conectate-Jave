import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MessageQueryDto } from './dto/message-query.dto.js';
import { SendMessageDto } from './dto/send-message.dto.js';
import { CreateChatDto } from './dto/create-chat.dto.js';
import { SubjectsService } from '../subjects/subjects.service.js';
import { serverResponse } from '../server-response.js';

export interface Chat {
  id: string;
  subjectId: string;
  subjectName: string;
  professor: string;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderRole: 'student' | 'professor';
  text: string;
  sentAt: string;
  read: boolean;
}

@Injectable()
export class ChatsService {
  private readonly chats = new Map<string, Chat>([
    ['chat_101', { id: 'chat_101', subjectId: 'subj_101', subjectName: 'Programación Computacional', professor: 'Prof. Horacio Gómez' }],
    ['chat_102', { id: 'chat_102', subjectId: 'subj_102', subjectName: 'Cálculo Diferencial', professor: 'Prof. Sara Martínez' }],
  ]);
  private readonly messages = new Map<string, ChatMessage[]>([
    [
      'chat_101',
      [
        {
          id: 'msg_501',
          chatId: 'chat_101',
          senderId: 'professor_1',
          senderRole: 'professor',
          text: 'Bienvenidos al curso de Programación Computacional.',
          sentAt: new Date().toISOString(),
          read: false,
        },
      ],
    ],
    ['chat_102', []],
  ]);
  private idCounter = 103;

  constructor(private readonly subjectsService: SubjectsService) {}

  createChat(dto: CreateChatDto) {
    if (typeof dto?.subjectId !== 'string' || !dto.subjectId.trim())
      throw new BadRequestException('El ID de la materia es obligatorio');

    const subject = this.subjectsService.findOne(dto.subjectId.trim()).data;
    const id = `chat_${this.idCounter++}`;
    const chat: Chat = {
      id,
      subjectId: subject.id,
      subjectName: subject.name,
      professor: subject.professor,
    };
    this.chats.set(id, chat);
    this.messages.set(id, []);
    return serverResponse(chat, 'Chat creado exitosamente', 201);
  }

  findAll() {
    const chats = [...this.chats.values()].map((chat) => ({
      ...chat,
      unreadCount: this.unread(chat.id),
      lastMessage: this.lastMessage(chat.id),
    }));
    return serverResponse(chats, 'Chats encontrados exitosamente');
  }

  findMessages(chatId: string, query: MessageQueryDto) {
    this.ensureChat(chatId);
    const page = query.page === undefined ? 1 : Number(query.page);
    const pageSize = query.pageSize === undefined ? 30 : Number(query.pageSize);
    if (
      !Number.isInteger(page) ||
      page < 1 ||
      !Number.isInteger(pageSize) ||
      pageSize < 1 ||
      pageSize > 100
    )
      throw new BadRequestException(
        'page y pageSize deben ser enteros positivos (máximo 100)',
      );
    return serverResponse([...(this.messages.get(chatId) ?? [])]
      .reverse()
      .slice((page - 1) * pageSize, page * pageSize), 'Mensajes encontrados exitosamente');
  }

  createMessage(chatId: string, userId: string, dto: SendMessageDto) {
    this.ensureChat(chatId);
    if (typeof dto?.text !== 'string' || !dto.text.trim())
      throw new BadRequestException('El texto del mensaje es obligatorio');
    const message: ChatMessage = {
      id: `msg_${this.idCounter++}`,
      chatId,
      senderId: userId,
      senderRole: 'student',
      text: dto.text.trim(),
      sentAt: new Date().toISOString(),
      read: true,
    };
    this.messages.get(chatId)!.push(message);
    return serverResponse(message, 'Mensaje enviado exitosamente', 201);
  }

  private ensureChat(id: string) {
    if (!this.messages.has(id))
      throw new NotFoundException('El chat solicitado no existe');
  }
  private lastMessage(chatId: string) {
    const messages = this.messages.get(chatId) ?? [];
    return messages.at(-1) ?? null;
  }
  private unread(chatId: string) {
    return (this.messages.get(chatId) ?? []).filter(
      (message) => !message.read && message.senderRole === 'professor',
    ).length;
  }
}
