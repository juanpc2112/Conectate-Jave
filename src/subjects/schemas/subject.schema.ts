import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class StoredMessage {
  @Prop({ required: true }) id!: string;
  @Prop({ required: true }) senderId!: number;
  @Prop({ default: '' }) senderName!: string;
  @Prop({ required: true, enum: ['student', 'professor'] })
  senderRole!: 'student' | 'professor';
  @Prop({ required: true }) text!: string;
  @Prop({ required: true }) sentAt!: Date;
  @Prop({ default: false }) read!: boolean;
}
const StoredMessageSchema = SchemaFactory.createForClass(StoredMessage);

@Schema({ timestamps: true, versionKey: false })
export class Subject {
  @Prop({ required: true, unique: true }) id!: string;
  @Prop({ required: true, unique: true, uppercase: true }) code!: string;
  @Prop({ required: true, trim: true }) name!: string;
  @Prop({ required: true }) professorId!: number;
  @Prop({ required: true, trim: true }) professor!: string;
  @Prop({ default: '#3F9AB3' }) color!: string;
  @Prop({ type: [Number], default: [] }) studentIds!: number[];
  @Prop({ type: [StoredMessageSchema], default: [] })
  messages!: StoredMessage[];
  createdAt!: Date;
  updatedAt!: Date;
}

export const SubjectSchema = SchemaFactory.createForClass(Subject);
SubjectSchema.index({ professorId: 1, name: 1 });
SubjectSchema.index({ studentIds: 1 });
