import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Employee } from '../employees/employee.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Employee)
    private readonly repo: Repository<Employee>,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(company_email: string, password: string) {
    const employee = await this.repo.findOneBy({ company_email });
    if (!employee) return null;
    const ok = await bcrypt.compare(password, employee.password_hash);
    return ok ? employee : null;
  }

  async login(company_email: string, password: string) {
    const employee = await this.validateUser(company_email, password);
    if (!employee) throw new UnauthorizedException('Invalid credentials');
    const payload = {
      sub: employee.id,
      email: employee.company_email,
      role: employee.role,
    };
    return {
      accessToken: await this.jwtService.signAsync(payload),
      employee,
    };
  }
}
