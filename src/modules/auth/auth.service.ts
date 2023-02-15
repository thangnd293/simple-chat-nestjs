import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserDocument } from 'modules/user/schema/user.schema';
import { UserService } from 'modules/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findOne({
      username,
      password: password,
    });

    if (user) {
      return user;
    }
    return null;
  }

  async login(user: UserDocument) {
    const payload = { id: user._id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
