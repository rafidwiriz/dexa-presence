import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('profile_changes')
export class ProfileChange {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  employee_id: string;

  @Column()
  changed_by: string;

  @Column({ type: 'jsonb' })
  fields: Record<string, { old: unknown; new: unknown }>;

  @Column({ type: 'timestamptz' })
  occurred_at: Date;

  @Column({ length: 40, default: 'rabbitmq' })
  source: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
