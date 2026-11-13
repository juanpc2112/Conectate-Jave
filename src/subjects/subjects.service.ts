import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { randomBytes, randomUUID } from 'node:crypto';
import { Model } from 'mongoose';
import { AuthService } from '../auth/auth.service.js';
import { serverResponse } from '../server-response.js';
import { Subject } from './schemas/subject.schema.js';

@Injectable()
export class SubjectsService {
  constructor(
    @InjectModel(Subject.name) private readonly subjectModel: Model<Subject>,
    private readonly authService: AuthService,
  ) {}

  async findAll(userId: number) {
    const user = await this.authService.findUser(userId);
    const filter = user.role === 'professor'
      ? { professorId: userId }
      : { studentIds: userId };
    const subjects = await this.subjectModel.find(filter).sort({ name: 1 }).lean().exec();
    return serverResponse(subjects.map(({ messages: _messages, ...subject }) => subject), 'Materias encontradas exitosamente');
  }

  async findOne(id: string, userId: number) {
    const subject = await this.requireMember(id, userId);
    return serverResponse(this.publicSubject(subject), 'Materia encontrada exitosamente');
  }

  async create(userId: number, name: string) {
    const user = await this.authService.findUser(userId);
    if (user.role !== 'professor') throw new ForbiddenException('Solo los profesores pueden crear clases');
    if (typeof name !== 'string' || !name.trim()) throw new BadRequestException('El nombre de la materia es obligatorio');
    let code = '';
    do { code = randomBytes(4).toString('hex').slice(0, 6).toUpperCase(); }
    while (await this.subjectModel.exists({ code }));
    const subject = await this.subjectModel.create({
      id: `class_${randomUUID()}`,
      code,
      name: name.trim(),
      professorId: userId,
      professor: user.name,
      studentIds: [],
      messages: [],
    });
    return serverResponse(this.publicSubject(subject), 'Clase creada. Comparte el código con tus estudiantes.', 201);
  }

  async join(userId: number, code: string) {
    const user = await this.authService.findUser(userId);
    if (user.role !== 'student') throw new ForbiddenException('Solo los estudiantes pueden unirse con un código');
    if (typeof code !== 'string' || !code.trim()) throw new BadRequestException('Ingresa el código de la clase');
    const subject = await this.subjectModel.findOneAndUpdate(
      { code: code.trim().toUpperCase() },
      { $addToSet: { studentIds: userId } },
      { new: true },
    ).exec();
    if (!subject) throw new NotFoundException('No encontramos una clase con ese código');
    return serverResponse(this.publicSubject(subject), 'Te uniste a la clase exitosamente', 200);
  }

  async requireMember(subjectId: string, userId: number) {
    const subject = await this.subjectModel.findOne({ id: subjectId }).exec();
    if (!subject) throw new NotFoundException('La materia solicitada no existe');
    if (subject.professorId !== userId && !subject.studentIds.includes(userId)) {
      throw new ForbiddenException('Debes unirte a esta clase para acceder');
    }
    return subject;
  }

  async appendMessage(subjectId: string, userId: number, text: string) {
    const subject = await this.requireMember(subjectId, userId);
    const user = await this.authService.findUser(userId);
    const message = {
      id: `msg_${randomUUID()}`,
      senderId: userId,
      senderRole: user.role,
      text: text.trim(),
      sentAt: new Date(),
      read: true,
    };
    subject.messages.push(message);
    await subject.save();
    return message;
  }

  private publicSubject(subject: Subject) {
    return {
      id: subject.id,
      code: subject.code,
      name: subject.name,
      professor: subject.professor,
      professorId: subject.professorId,
      color: subject.color,
    };
  }
}
