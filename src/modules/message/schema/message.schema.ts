import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose';
import { Conversation } from 'modules/conversation/schema/conversation.schema';
import { User, UserDocument } from 'modules/user/schema/user.schema';
import mongoose, { LeanDocument, Types } from 'mongoose';
import { Timestamp } from 'types/common';

@Schema({ timestamps: true })
export class Message {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
  })
  conversation: Conversation;

  @Prop()
  type: string;

  @Prop()
  content: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  })
  sender: UserDocument;

  @Prop()
  isDeleted: boolean;

  @Prop({
    default: 'sent',
  })
  status: string;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

export type MessageDocument = LeanDocument<Message> & {
  _id: Types.ObjectId;
} & Timestamp;
