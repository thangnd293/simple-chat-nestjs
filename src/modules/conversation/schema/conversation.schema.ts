import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Message } from 'modules/message/schema/message.schema';
import { User } from 'modules/user/schema/user.schema';
import mongoose, { LeanDocument, Types } from 'mongoose';
import { UserLastSeen } from './user-last-seen.schema';

@Schema({ timestamps: true })
export class Conversation {
  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  })
  members: [User];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Message' })
  lastMessage: Message;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'UserLastSeen' }],
  })
  UserLastSeen: UserLastSeen;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
export type ConversationDocument = LeanDocument<Conversation> & {
  _id: Types.ObjectId;
};
