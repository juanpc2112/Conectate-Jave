import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { serverResponse } from '../server-response.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { User } from './schemas/user.schema.js';

@Injectable()
export class AuthService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {}

  async register(dto: RegisterDto) {
    this.validateRegister(dto);
    const email = dto.email.toLowerCase();
    if (await this.userModel.exists({ email })) {
      throw new ConflictException('El correo ya está registrado');
    }

    const lastUser = await this.userModel
      .findOne()
      .sort({ id: -1 })
      .select({ id: 1 })
      .lean()
      .exec();
    const id = (lastUser?.id ?? 0) + 1;
    const user = await this.userModel.create({
      id,
      name: dto.name.trim(),
      email,
      career: dto.career.trim(),
      semester: dto.semester,
      avatarUrl: null,
      points: 0,
      notesCount: 0,
      passwordHash: this.hashPassword(dto.password),
    });
    return serverResponse(this.toPublicUser(user), 'Usuario creado exitosamente', 201);
  }

  async login(dto: LoginDto) {
    this.validateLogin(dto);
    const user = await this.userModel
      .findOne({ email: dto.email.toLowerCase() })
      .select('+passwordHash')
      .exec();
    if (!user || !this.verifyPassword(dto.password, user.passwordHash)) {
      throw new UnauthorizedException('Correo o contraseña incorrectos');
    }
    return serverResponse(this.toPublicUser(user), 'Inicio de sesión exitoso');
  }

  async findUser(id: number) {
    const user = await this.userModel.findOne({ id }).exec();
    if (!user) throw new UnauthorizedException('Usuario no válido');
    return user;
  }

  async getPublicUser(id: number) {
    return serverResponse(
      this.toPublicUser(await this.findUser(id)),
      'Usuario encontrado exitosamente',
    );
  }

  async getPublicUsers() {
    const users = await this.userModel.find().sort({ id: 1 }).exec();
    return serverResponse(
      users.map((user) => this.toPublicUser(user)),
      'Usuarios encontrados exitosamente',
    );
  }

  async addNotePoints(id: number) {
    const user = await this.userModel
      .findOneAndUpdate(
        { id },
        { $inc: { points: 10, notesCount: 1 } },
        { new: true },
      )
      .exec();
    if (!user) throw new UnauthorizedException('Usuario no válido');
  }

  async getRanking(limit: number) {
    const users = await this.userModel
      .find()
      .sort({ points: -1, id: 1 })
      .limit(limit)
      .exec();
    return users.map((user, index) => ({
      position: index + 1,
      id: user.id,
      name: user.name,
      points: user.points,
      notesCount: user.notesCount,
    }));
  }

  async updateUser(
    id: number,
    changes: Partial<Pick<User, 'name' | 'career' | 'semester' | 'avatarUrl'>>,
  ) {
    if (changes.name !== undefined && !changes.name.trim()) {
      throw new BadRequestException('El nombre no puede estar vacío');
    }
    if (changes.career !== undefined && !changes.career.trim()) {
      throw new BadRequestException('La carrera no puede estar vacía');
    }
    if (
      changes.semester !== undefined &&
      (!Number.isInteger(changes.semester) || changes.semester < 1)
    ) {
      throw new BadRequestException('El semestre debe ser un entero positivo');
    }

    const user = await this.userModel
      .findOneAndUpdate({ id }, changes, { new: true, runValidators: true })
      .exec();
    if (!user) throw new UnauthorizedException('Usuario no válido');
    return serverResponse(this.toPublicUser(user), 'Usuario actualizado exitosamente');
  }

  async deleteUser(id: number) {
    const user = await this.userModel.findOneAndDelete({ id }).exec();
    if (!user) throw new UnauthorizedException('Usuario no válido');
    return serverResponse(null, 'Usuario eliminado exitosamente');
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

  private toPublicUser(user: User) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      career: user.career,
      semester: user.semester,
      avatarUrl: user.avatarUrl,
      points: user.points,
      notesCount: user.notesCount,
    };
  }
}
