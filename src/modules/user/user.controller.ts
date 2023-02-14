import { LoginDtoSchema } from './dto/login.dto';
import { JoiValidationPipe } from 'pipes/joi-validate.pipe';
import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Post('login')
  @UsePipes(new JoiValidationPipe(LoginDtoSchema))
  login(@Body() body) {
    return this.userService.login(body);
  }
}
