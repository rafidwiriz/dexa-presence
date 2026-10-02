import { Body, Controller, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ChangePasswordDto, LoginDto } from './auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser } from './current-user.decorator';
import { AuthUser } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('login')
  login(@Body() body: LoginDto) {
    return this.authService.login(body.company_email, body.password);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('password')
  changePassword(@Body() body: ChangePasswordDto, @CurrentUser() user: AuthUser) {
    return this.authService.changePassword(user.sub, body.current_password, body.new_password);
  }
}
