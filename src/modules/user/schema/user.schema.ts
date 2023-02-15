import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { LeanDocument, Types } from 'mongoose';
@Schema({
  timestamps: true,
})
export class User {
  @Prop()
  name: string;

  @Prop()
  username: string;

  @Prop()
  password: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

export type UserDocument = LeanDocument<User> & {
  _id: Types.ObjectId;
};
