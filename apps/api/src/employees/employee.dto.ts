import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { EmployeeRole } from './employee.entity';

export class CreateEmployeeDto {
  @IsString() @MaxLength(120) name: string;
  @IsEmail() company_email: string;
  @IsString() @MinLength(8) password: string;
  @IsString() @MaxLength(120) position: string;
  @IsOptional() @IsString() @MaxLength(30) phone?: string;
  @IsOptional() @IsEnum(EmployeeRole) role?: EmployeeRole;
}

export class UpdateEmployeeDto {
  @IsOptional() @IsString() @MaxLength(120) name?: string;
  @IsOptional() @IsString() @MaxLength(120) position?: string;
  @IsOptional() @IsString() @MaxLength(30) phone?: string;
  @IsOptional() @IsEnum(EmployeeRole) role?: EmployeeRole;
}
