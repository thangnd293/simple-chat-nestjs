import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { User } from 'modules/user/schema/user.schema';
import mongoose, { LeanDocument, Types } from 'mongoose';

export class UserLastSeen {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: User;

  @Prop()
  lastSeen: Date;
}

export const UserLastSeenSchema = SchemaFactory.createForClass(UserLastSeen);
export type UserLastSeenDocument = LeanDocument<UserLastSeen> & {
  _id: Types.ObjectId;
};
