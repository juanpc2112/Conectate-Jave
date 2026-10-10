import { Injectable, NotFoundException } from '@nestjs/common';
import { ServerResponse } from '../common/server-response.js';
import { SubjectDto } from './dto/subject.dto.js';

@Injectable()
export class SubjectsService {
  private readonly subjects: SubjectDto[] = [
    {
      id: 'subj_101',
      name: 'Programación Computacional',
      professor: 'Prof. Horacio Gómez',
      color: '#3F9AB3',
    },
    {
      id: 'subj_102',
      name: 'Cálculo Diferencial',
      professor: 'Prof. Sara Martínez',
      color: '#6BAF76',
    },
    {
      id: 'subj_103',
      name: 'Física Mecánica',
      professor: 'Prof. Andrés Rojas',
      color: '#D88A54',
    },
  ];

  findAll(): ServerResponse<SubjectDto[]> {
    const status = this.subjects.length > 0 ? 200 : 404;
    const message =
      status === 200
        ? 'Materias encontradas exitosamente'
        : 'No se encontraron materias';

    return new ServerResponse(this.subjects, status, message);
  }

  findOne(id: string): ServerResponse<SubjectDto> {
    const subject = this.subjects.find((item) => item.id === id);
    if (!subject) throw new NotFoundException('La materia solicitada no existe');
    return new ServerResponse(subject, 200, 'Materia encontrada exitosamente');
  }
}
