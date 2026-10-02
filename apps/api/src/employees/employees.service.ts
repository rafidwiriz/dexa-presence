import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { lastValueFrom } from 'rxjs';
import { Repository } from 'typeorm';
import { Employee } from './employee.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class EmployeesService {
  private readonly logger = new Logger(EmployeesService.name);

  constructor(
    @InjectRepository(Employee)
    private readonly repo: Repository<Employee>,
    @Inject('PROFILE_UPDATED_QUEUE')
    private readonly client: ClientProxy,
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
    const before = await this.findOne(id);
    await this.repo.update(id, data);
    const after = await this.findOne(id);

    const fields: Record<string, { old: unknown; new: unknown }> = {};
    for (const key of ['name', 'position', 'phone', 'photo_url'] as const) {
      if (before[key] !== after[key]) {
        fields[key] = { old: before[key], new: after[key] };
      }
    }

    if (Object.keys(fields).length > 0) {
      await this.emitProfileUpdated(after.id, fields);
    }
    return after;
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.repo.delete(id);
  }

  private async emitProfileUpdated(
    employeeId: string,
    fields: Record<string, { old: unknown; new: unknown }>,
  ): Promise<void> {
    try {
      await lastValueFrom(
        this.client.emit('profile.updated', {
          employeeId,
          changedBy: employeeId,
          fields,
          occurredAt: new Date().toISOString(),
        }),
      );
      this.logger.log(`Emitted profile.updated for employee ${employeeId}`);
    } catch (err) {
      // Never fail the HTTP request because the broker is down.
      this.logger.error(
        `Failed to publish profile.updated for ${employeeId}`,
        err instanceof Error ? err.stack : String(err),
      );
    }
  }
}
