import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true, versionKey: false })
export class User {
  @Prop({ required: true, unique: true })
  id!: number;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email!: string;

  @Prop({ required: true, select: false })
  passwordHash!: string;

  @Prop({ required: true, trim: true })
  career!: string;

  @Prop({ required: true, min: 1 })
  semester!: number;

  @Prop({ default: null })
  avatarUrl!: string | null;

  @Prop({ default: 0, min: 0 })
  points!: number;

  @Prop({ default: 0, min: 0 })
  notesCount!: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
