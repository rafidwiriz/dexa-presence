import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail() company_email: string;
  @IsString() @MinLength(1) password: string;
}

export class ChangePasswordDto {
  @IsString() current_password: string;
  @IsString() @MinLength(8) new_password: string;
}
