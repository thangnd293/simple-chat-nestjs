import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { tryCatchWrapper } from 'utils';
import { LoginDto } from './dto/login.dto';
import { User } from './schema/user.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  login = tryCatchWrapper(async (loginDto: LoginDto) => {
    const user = await this.userModel.findOne(loginDto).lean();
    if (!user)
      throw new HttpException('User not found', HttpStatus.UNAUTHORIZED);
    return user;
  });
}
