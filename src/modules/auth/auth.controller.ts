import { Controller, Post, Request, UseGuards, UsePipes } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JoiValidationPipe } from 'pipes/joi-validate.pipe';
import { AuthService } from './auth.service';
import { LoginDtoSchema } from './dto/login.dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @UseGuards(AuthGuard('local'))
  @Post('auth/login')
  @UsePipes(new JoiValidationPipe(LoginDtoSchema))
  login(@Request() req) {
    return this.authService.login(req.user);
  }
}
