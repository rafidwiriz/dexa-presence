import { Controller, Logger } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProfileChange } from './profile-change.entity';

export interface ProfileUpdatedEvent {
  employeeId: string;
  changedBy: string;
  fields: Record<string, { old: unknown; new: unknown }>;
  occurredAt: string;
}

@Controller()
export class ProfileAuditConsumer {
  private readonly logger = new Logger(ProfileAuditConsumer.name);

  constructor(
    @InjectRepository(ProfileChange, 'audit') // ← 'audit' connection!
    private readonly repo: Repository<ProfileChange>,
  ) {}

  @EventPattern('profile.updated') // ← queue message with this pattern
  async handleProfileUpdated(data: ProfileUpdatedEvent): Promise<void> {
    await this.repo.save(
      this.repo.create({
        employee_id: data.employeeId,
        changed_by: data.changedBy,
        fields: data.fields,
        occurred_at: new Date(data.occurredAt),
        source: 'rabbitmq',
      }),
    );
    this.logger.log(`Logged profile change for employee ${data.employeeId}`);
  }
}
