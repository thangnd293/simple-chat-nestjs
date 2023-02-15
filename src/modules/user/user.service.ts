import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, ProjectionType } from 'mongoose';
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
}
