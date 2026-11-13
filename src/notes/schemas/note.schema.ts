import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class NoteRating {
  @Prop({ required: true }) userId!: number;
  @Prop({ required: true, min: 1, max: 5 }) stars!: number;
}
const NoteRatingSchema = SchemaFactory.createForClass(NoteRating);

@Schema({ timestamps: true, versionKey: false })
export class Note {
  @Prop({ required: true, unique: true }) id!: string;
  @Prop({ required: true, index: true }) subjectId!: string;
  @Prop({ required: true }) authorId!: number;
  @Prop({ required: true }) authorName!: string;
  @Prop({ required: true, trim: true }) title!: string;
  @Prop({ required: true }) fileName!: string;
  @Prop({ required: true }) fileData!: string;
  @Prop({ type: [NoteRatingSchema], default: [] }) ratings!: NoteRating[];
  @Prop({ type: [Number], default: [] }) bookmarks!: number[];
  createdAt!: Date;
  updatedAt!: Date;
}

export const NoteSchema = SchemaFactory.createForClass(Note);
NoteSchema.index({ subjectId: 1, createdAt: -1 });
