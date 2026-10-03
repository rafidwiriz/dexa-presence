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

  async changePassword(
    employeeId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<{ ok: boolean }> {
    const employee = await this.repo.findOneBy({ id: employeeId });
    if (!employee) throw new UnauthorizedException('Employee not found');

    const valid = await bcrypt.compare(currentPassword, employee.password_hash);
    if (!valid)
      throw new UnauthorizedException('Current password is incorrect');

    employee.password_hash = await bcrypt.hash(newPassword, 10);
    await this.repo.save(employee);
    return { ok: true };
  }
}
