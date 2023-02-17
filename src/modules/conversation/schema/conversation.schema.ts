import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Message } from 'modules/message/schema/message.schema';
import { UserDocument } from 'modules/user/schema/user.schema';
import mongoose, { LeanDocument, Types } from 'mongoose';
import { LastActive, LastActiveSchema } from './lastActive.schema';

@Schema({ timestamps: true })
export class Conversation {
  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  })
  members: [UserDocument];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Message' })
  lastMessage: Message;

  @Prop({
    type: [LastActiveSchema],
  })
  lastSeen: LastActive[];

  @Prop({
    type: [LastActiveSchema],
  })
  lastReceived: LastActive[];
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
export type ConversationDocument = LeanDocument<Conversation> & {
  _id: Types.ObjectId;
};
