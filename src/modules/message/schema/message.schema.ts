import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose';
import { Conversation } from 'modules/conversation/schema/conversation.schema';
import { User } from 'modules/user/schema/user.schema';
import mongoose, { LeanDocument, Types } from 'mongoose';

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
  sender: User;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  })
  receiver: User;

  @Prop()
  isDeleted: boolean;

  @Prop()
  isDelivered: boolean;

  @Prop()
  isSeen: boolean;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

export type MessageDocument = LeanDocument<Message> & {
  _id: Types.ObjectId;
};
