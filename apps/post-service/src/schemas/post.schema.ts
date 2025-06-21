import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Post {
  @Prop({ required: true })
  userId: string;

  @Prop()
  caption?: string;

  @Prop({ required: true })
  mediaUrl: string;
}

export type PostDocument = Post & Document;
export const PostSchema = SchemaFactory.createForClass(Post); 