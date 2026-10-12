import {
  ConflictException,
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { serverResponse } from '../server-response.js';

export interface UserRecord {
  id: number;
  name: string;
  email: string;
  career: string;
  semester: number;
  avatarUrl: string | null;
  points: number;
  notesCount: number;
  passwordHash: string;
}

@Injectable()
export class AuthService {
  private readonly users: UserRecord[] = [];
  private nextUserId = 1;
  register(dto: RegisterDto) {
    this.validateRegister(dto);
    if (this.users.some((user) => user.email === dto.email.toLowerCase())) {
      throw new ConflictException('El correo ya está registrado');
    }

    const user: UserRecord = {
      id: this.nextUserId++,
      name: dto.name.trim(),
      email: dto.email.toLowerCase(),
      career: dto.career.trim(),
      semester: dto.semester,
      avatarUrl: null,
      points: 0,
      notesCount: 0,
      passwordHash: this.hashPassword(dto.password),
    };
    this.users.push(user);
    return serverResponse(this.toPublicUser(user), 'Usuario creado exitosamente', 201);
  }

  login(dto: LoginDto) {
    this.validateLogin(dto);
    const user = this.users.find(
      (candidate) => candidate.email === dto.email.toLowerCase(),
    );
    if (!user || !this.verifyPassword(dto.password, user.passwordHash)) {
      throw new UnauthorizedException('Correo o contraseña incorrectos');
    }
    return serverResponse(this.toPublicUser(user), 'Inicio de sesión exitoso');
  }

  findUser(id: number): UserRecord {
    const user = this.users.find((candidate) => candidate.id === id);
    if (!user) throw new UnauthorizedException('Usuario no válido');
    return user;
  }

  getPublicUser(id: number) {
    return serverResponse(this.toPublicUser(this.findUser(id)), 'Usuario encontrado exitosamente');
  }

  getPublicUsers() {
    return serverResponse(this.users.map((user) => this.toPublicUser(user)), 'Usuarios encontrados exitosamente');
  }

  updateUser(id: number, changes: Partial<Pick<UserRecord, 'name' | 'career' | 'semester' | 'avatarUrl'>>) {
    const user = this.findUser(id);
    if (changes.name !== undefined && !changes.name.trim()) {
      throw new BadRequestException('El nombre no puede estar vacío');
    }
    if (changes.career !== undefined && !changes.career.trim()) {
      throw new BadRequestException('La carrera no puede estar vacía');
    }
    if (changes.semester !== undefined && (!Number.isInteger(changes.semester) || changes.semester < 1)) {
      throw new BadRequestException('El semestre debe ser un entero positivo');
    }
    Object.assign(user, changes);
    return serverResponse(this.toPublicUser(user), 'Usuario actualizado exitosamente');
  }

  private validateRegister(dto: RegisterDto): void {
    if (!dto.name?.trim() || !dto.career?.trim()) {
      throw new BadRequestException('Nombre y carrera son obligatorios');
    }
    if (!this.isInstitutionalEmail(dto.email)) {
      throw new BadRequestException('Se requiere un correo institucional @javerianacali.edu.co');
    }
    if (!dto.password || dto.password.length < 8) {
      throw new BadRequestException('La contraseña debe tener al menos 8 caracteres');
    }
    if (!Number.isInteger(dto.semester) || dto.semester < 1) {
      throw new BadRequestException('El semestre debe ser un entero positivo');
    }
  }

  private validateLogin(dto: LoginDto): void {
    if (!this.isInstitutionalEmail(dto.email) || !dto.password) {
      throw new BadRequestException('Correo institucional y contraseña son obligatorios');
    }
  }

  private isInstitutionalEmail(email: string): boolean {
    return /^[^\s@]+@javerianacali\.edu\.co$/i.test(email ?? '');
  }

  private hashPassword(password: string): string {
    const salt = randomBytes(16).toString('hex');
    return `${salt}:${scryptSync(password, salt, 64).toString('hex')}`;
  }

  private verifyPassword(password: string, stored: string): boolean {
    const [salt, hash] = stored.split(':');
    if (!salt || !hash) return false;
    const expected = Buffer.from(hash, 'hex');
    const actual = scryptSync(password, salt, expected.length);
    return expected.length === actual.length && timingSafeEqual(expected, actual);
  }

  private toPublicUser(user: UserRecord) {
    const { passwordHash: _passwordHash, ...publicUser } = user;
    return publicUser;
  }
}
