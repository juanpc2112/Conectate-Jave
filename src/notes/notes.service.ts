import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { randomUUID } from 'node:crypto';
import { Model } from 'mongoose';
import { AuthService } from '../auth/auth.service.js';
import { SubjectsService } from '../subjects/subjects.service.js';
import { serverResponse } from '../server-response.js';
import { CreateNoteDto } from './dto/create-note.dto.js';
import { RateNoteDto } from './dto/rate-note.dto.js';
import { Note } from './schemas/note.schema.js';

@Injectable()
export class NotesService {
  constructor(
    @InjectModel(Note.name) private readonly noteModel: Model<Note>,
    private readonly authService: AuthService,
    private readonly subjectsService: SubjectsService,
  ) {}

  async findBySubject(subjectId: string, userId: number) {
    await this.subjectsService.requireMember(subjectId, userId);
    const notes = await this.noteModel.find({ subjectId }).sort({ createdAt: -1 }).exec();
    return serverResponse(notes.map((note) => this.toResponse(note, userId)), 'Apuntes encontrados exitosamente');
  }

  async findBookmarks(userId: number) {
    const notes = await this.noteModel.find({ bookmarks: userId }).sort({ createdAt: -1 }).exec();
    return serverResponse(notes.map((note) => this.toResponse(note, userId)), 'Apuntes guardados encontrados exitosamente');
  }

  async findOne(id: string, userId: number) {
    const note = await this.findRecord(id);
    await this.subjectsService.requireMember(note.subjectId, userId);
    return serverResponse(this.toResponse(note, userId), 'Apunte encontrado exitosamente');
  }

  async getFile(id: string, userId: number) {
    const note = await this.findRecord(id);
    await this.subjectsService.requireMember(note.subjectId, userId);
    return { data: Buffer.from(note.fileData, 'base64'), fileName: note.fileName };
  }

  async create(subjectId: string, userId: number, dto: CreateNoteDto) {
    await this.subjectsService.requireMember(subjectId, userId);
    const user = await this.authService.findUser(userId);
    if (user.role !== 'student') throw new ForbiddenException('Solo los estudiantes pueden compartir apuntes');
    const fileData = this.validate(dto);
    const note = await this.noteModel.create({
      id: `note_${randomUUID()}`,
      subjectId,
      authorId: userId,
      authorName: user.name,
      title: dto.title.trim(),
      fileName: dto.fileName.trim(),
      fileData,
      ratings: [],
      bookmarks: [],
    });
    await this.authService.addNotePoints(userId);
    return serverResponse(this.toResponse(note, userId), 'Apunte creado exitosamente', 201);
  }

  async update(id: string, userId: number, dto: CreateNoteDto) {
    const note = await this.findRecord(id);
    this.ensureOwner(note, userId);
    await this.subjectsService.requireMember(note.subjectId, userId);
    const fileData = this.validate(dto);
    note.title = dto.title.trim();
    note.fileName = dto.fileName.trim();
    note.fileData = fileData;
    await note.save();
    return serverResponse(this.toResponse(note, userId), 'Apunte actualizado exitosamente');
  }

  async remove(id: string, userId: number) {
    const note = await this.findRecord(id);
    this.ensureOwner(note, userId);
    await note.deleteOne();
    return serverResponse(null, 'Apunte eliminado exitosamente');
  }

  async rate(id: string, userId: number, dto: RateNoteDto) {
    const note = await this.findRecord(id);
    await this.subjectsService.requireMember(note.subjectId, userId);
    if (!Number.isInteger(dto?.stars) || dto.stars < 1 || dto.stars > 5) {
      throw new BadRequestException('La calificación debe ser un entero entre 1 y 5');
    }
    if (note.authorId === userId) throw new ForbiddenException('No puedes calificar tu propio apunte');
    const existing = note.ratings.find((rating) => rating.userId === userId);
    const pointsDelta = dto.stars - (existing?.stars ?? 0);
    if (existing) existing.stars = dto.stars;
    else note.ratings.push({ userId, stars: dto.stars });
    await note.save();
    await this.authService.addRatingPoints(note.authorId, pointsDelta);
    return serverResponse(this.toResponse(note, userId), 'Calificación guardada; los puntos del autor se actualizaron.', 200);
  }

  async bookmark(id: string, userId: number) {
    const note = await this.findRecord(id);
    await this.subjectsService.requireMember(note.subjectId, userId);
    await this.noteModel.updateOne({ id }, { $addToSet: { bookmarks: userId } }).exec();
    return serverResponse(null, 'Apunte guardado exitosamente');
  }

  async unbookmark(id: string, userId: number) {
    const note = await this.findRecord(id);
    await this.subjectsService.requireMember(note.subjectId, userId);
    await this.noteModel.updateOne({ id }, { $pull: { bookmarks: userId } }).exec();
    return serverResponse(null, 'Apunte quitado de guardados exitosamente');
  }

  async search(query: string, userId: number) {
    const subjects = await this.subjectsService.findAll(userId);
    const subjectIds = subjects.data.map((subject) => subject.id);
    const term = query.toLocaleLowerCase();
    const notes = await this.noteModel.find({ subjectId: { $in: subjectIds } }).sort({ createdAt: -1 }).exec();
    return notes.map((note) => this.toResponse(note, userId)).filter((note) =>
      `${note.title} ${note.authorName}`.toLocaleLowerCase().includes(term),
    );
  }

  private async findRecord(id: string) {
    const note = await this.noteModel.findOne({ id }).exec();
    if (!note) throw new NotFoundException('El apunte solicitado no existe');
    return note;
  }

  private ensureOwner(note: Note, userId: number) {
    if (note.authorId !== userId) throw new ForbiddenException('El apunte no pertenece al estudiante autenticado');
  }

  private validate(dto: CreateNoteDto) {
    if (!dto?.title?.trim() || !dto.fileName?.trim() || !dto.fileData) {
      throw new BadRequestException('El título y el archivo PDF son obligatorios');
    }
    if (!dto.fileName.toLocaleLowerCase().endsWith('.pdf')) throw new BadRequestException('El archivo debe ser PDF');
    const encoded = dto.fileData.replace(/^data:application\/pdf;base64,/, '');
    const buffer = Buffer.from(encoded, 'base64');
    if (buffer.length > 10 * 1024 * 1024) throw new BadRequestException('El PDF no puede superar 10 MB');
    if (buffer.length < 5 || buffer.subarray(0, 5).toString() !== '%PDF-') throw new BadRequestException('El archivo no parece ser un PDF válido');
    return buffer.toString('base64');
  }

  private toResponse(note: Note, userId: number) {
    const ratings = note.ratings.map((rating) => rating.stars);
    const averageRating = ratings.length
      ? Math.round((ratings.reduce((sum, stars) => sum + stars, 0) / ratings.length) * 10) / 10
      : 0;
    return {
      id: note.id,
      subjectId: note.subjectId,
      authorId: String(note.authorId),
      authorName: note.authorName,
      title: note.title,
      fileName: note.fileName,
      fileUrl: `/notes/${note.id}/file`,
      averageRating,
      ratingsCount: ratings.length,
      myRating: note.ratings.find((rating) => rating.userId === userId)?.stars ?? 0,
      featured: averageRating >= 4,
      createdAt: note.createdAt,
      bookmarked: note.bookmarks.includes(userId),
    };
  }
}
