import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateNoteDto } from './dto/create-note.dto.js';
import { RateNoteDto } from './dto/rate-note.dto.js';
import { serverResponse } from '../server-response.js';

interface NoteRecord {
  id: string;
  subjectId: string;
  authorId: string;
  authorName: string;
  title: string;
  fileUrl: string;
  averageRating: number;
  ratingsCount: number;
  featured: boolean;
  createdAt: string;
  ratings: number[];
  bookmarks: Set<string>;
}

@Injectable()
export class NotesService {
  private readonly notes: NoteRecord[] = [
    {
      id: 'note_301',
      subjectId: 'subj_101',
      authorId: 'user_demo',
      authorName: 'Horacio',
      title: 'Apuntes de Programación',
      fileUrl: 'https://cdn.conectatejave.co/notes/note_301.pdf',
      averageRating: 4.5,
      ratingsCount: 2,
      featured: true,
      createdAt: new Date().toISOString(),
      ratings: [4, 5],
      bookmarks: new Set(),
    },
    {
      id: 'note_302',
      subjectId: 'subj_102',
      authorId: 'user_demo',
      authorName: 'Sara',
      title: 'Cálculo diferencial: resumen',
      fileUrl: 'https://cdn.conectatejave.co/notes/note_302.pdf',
      averageRating: 4,
      ratingsCount: 1,
      featured: true,
      createdAt: new Date().toISOString(),
      ratings: [4],
      bookmarks: new Set(),
    },
  ];
  private idCounter = 1;

  findBySubject(subjectId: string, userId: string) {
    this.ensureSubject(subjectId);
    return serverResponse(this.notes
      .filter((note) => note.subjectId === subjectId)
      .map((note) => this.toResponse(note, userId)), 'Apuntes encontrados exitosamente');
  }
  findBookmarks(userId: string) {
    return serverResponse(this.notes
      .filter((note) => note.bookmarks.has(userId))
      .map((note) => this.toResponse(note, userId)), 'Apuntes guardados encontrados exitosamente');
  }
  findOne(id: string, userId: string) {
    return serverResponse(this.toResponse(this.findRecord(id), userId), 'Apunte encontrado exitosamente');
  }
  create(
    subjectId: string,
    userId: string,
    authorName: string,
    dto: CreateNoteDto,
  ) {
    this.ensureSubject(subjectId);
    this.validate(dto);
    const note: NoteRecord = {
      id: `note_${this.idCounter++}`,
      subjectId,
      authorId: userId,
      authorName,
      title: dto.title.trim(),
      fileUrl: dto.fileUrl.trim(),
      averageRating: 0,
      ratingsCount: 0,
      featured: false,
      createdAt: new Date().toISOString(),
      ratings: [],
      bookmarks: new Set(),
    };
    this.notes.push(note);
    return serverResponse(this.toResponse(note, userId), 'Apunte creado exitosamente', 201);
  }
  update(id: string, userId: string, dto: CreateNoteDto) {
    const note = this.findRecord(id);
    this.ensureOwner(note, userId);
    this.validate(dto);
    note.title = dto.title.trim();
    note.fileUrl = dto.fileUrl.trim();
    return serverResponse(this.toResponse(note, userId), 'Apunte actualizado exitosamente');
  }
  remove(id: string, userId: string) {
    const note = this.findRecord(id);
    this.ensureOwner(note, userId);
    this.notes.splice(this.notes.indexOf(note), 1);
    return serverResponse(null, 'Apunte eliminado exitosamente');
  }
  rate(id: string, userId: string, dto: RateNoteDto) {
    const note = this.findRecord(id);
    if (!Number.isInteger(dto?.stars) || dto.stars < 1 || dto.stars > 5)
      throw new BadRequestException(
        'La calificación debe ser un entero entre 1 y 5',
      );
    note.ratings.push(dto.stars);
    note.ratingsCount = note.ratings.length;
    note.averageRating =
      Math.round(
        (note.ratings.reduce((sum, value) => sum + value, 0) /
          note.ratingsCount) *
          10,
      ) / 10;
    note.featured = note.averageRating >= 4;
    return serverResponse(this.toResponse(note, userId), 'Calificación guardada exitosamente');
  }
  bookmark(id: string, userId: string) {
    this.findRecord(id).bookmarks.add(userId);
    return serverResponse(null, 'Apunte guardado exitosamente');
  }
  unbookmark(id: string, userId: string) {
    this.findRecord(id).bookmarks.delete(userId);
    return serverResponse(null, 'Apunte quitado de guardados exitosamente');
  }
  ranking(limit: number) {
    if (!Number.isInteger(limit) || limit < 1 || limit > 100)
      throw new BadRequestException('limit debe ser un entero entre 1 y 100');
    return [...this.notes]
      .sort(
        (a, b) =>
          b.averageRating - a.averageRating || b.ratingsCount - a.ratingsCount,
      )
      .slice(0, limit)
      .map((note, index) => ({
        rank: index + 1,
        studentName: note.authorName,
        noteTitle: note.title,
        points: Math.round(note.averageRating * note.ratingsCount * 10),
      }));
  }
  search(query: string, userId: string) {
    const term = query.toLocaleLowerCase();
    return serverResponse(this.notes
      .filter((note) =>
        `${note.title} ${note.authorName}`.toLocaleLowerCase().includes(term),
      )
      .map((note) => this.toResponse(note, userId)), 'Resultados encontrados exitosamente');
  }

  private findRecord(id: string) {
    const note = this.notes.find((item) => item.id === id);
    if (!note) throw new NotFoundException('El apunte solicitado no existe');
    return note;
  }
  private ensureSubject(id: string) {
    if (!['subj_101', 'subj_102', 'subj_103'].includes(id))
      throw new NotFoundException('La materia solicitada no existe');
  }
  private ensureOwner(note: NoteRecord, userId: string) {
    if (note.authorId !== userId)
      throw new ForbiddenException(
        'El apunte no pertenece al estudiante autenticado',
      );
  }
  private validate(dto: CreateNoteDto) {
    if (!dto?.title?.trim() || !dto?.fileUrl?.trim())
      throw new BadRequestException(
        'El título y la URL del archivo son obligatorios',
      );
  }
  private toResponse(note: NoteRecord, userId: string) {
    const { ratings: _ratings, bookmarks, ...data } = note;
    return { ...data, bookmarked: bookmarks.has(userId) };
  }
}
