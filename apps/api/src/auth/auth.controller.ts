import { Body, Controller, ForbiddenException, Patch, Post, UseGuards } from '@nestjs/common';
import { IsString, MinLength } from 'class-validator';
import { AuthService } from './auth.service';
import { LoginDto } from './auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser } from './current-user.decorator';
import { AuthUser } from './jwt-auth.guard';

export class ChangePasswordDto {
  @IsString() current_password: string;
  @IsString() @MinLength(8) new_password: string;
}

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
