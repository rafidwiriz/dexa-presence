import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from './employee.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private readonly repo: Repository<Employee>,
  ) {}

  findAll(): Promise<Employee[]> {
    return this.repo.find();
  }

  async findOne(id: string): Promise<Employee> {
    const employee = await this.repo.findOneBy({ id });
    if (!employee) throw new NotFoundException(`Employee ${id} not found`);
    return employee;
  }

  async create(data: Partial<Employee>): Promise<Employee> {
    const employee = this.repo.create(data);
    if (data.password_hash) {
      employee.password_hash = await bcrypt.hash(data.password_hash, 10);
    }
    return this.repo.save(employee);
  }

  async update(id: string, data: Partial<Employee>): Promise<Employee> {
    await this.findOne(id);
    await this.repo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.repo.delete(id);
  }
}
