import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose';
import { User } from 'modules/user/schema/user.schema';
import mongoose, { LeanDocument, Types } from 'mongoose';

@Schema()
export class LastActive {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: Types.ObjectId | User;

  @Prop()
  time: Date;
}

export const LastActiveSchema = SchemaFactory.createForClass(LastActive);
export type LastActiveDocument = LeanDocument<LastActive> & {
  _id: Types.ObjectId;
};
