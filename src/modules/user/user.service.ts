import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, ProjectionType, Types } from 'mongoose';
import { tryCatchWrapper } from 'utils';
import { User, UserDocument } from './schema/user.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  findOne = tryCatchWrapper(
    async (filter?: FilterQuery<User>, projection?: ProjectionType<User>) => {
      const user = await this.userModel.findOne(filter, projection).lean();
      return user;
    },
  );

  getMe = tryCatchWrapper(async (user: Omit<UserDocument, 'password'>) => {
    return user;
  });

  updateLastOnline = tryCatchWrapper(async (id: string) => {
    return await this.userModel
      .findByIdAndUpdate(new Types.ObjectId(id), {
        lastOnline: new Date(),
      })
      .lean();
  });

  updateOnline = tryCatchWrapper(async (id: string, isOnline: boolean) => {
    return await this.userModel
      .findByIdAndUpdate(new Types.ObjectId(id), {
        isOnline,
      })
      .lean();
  });
}
