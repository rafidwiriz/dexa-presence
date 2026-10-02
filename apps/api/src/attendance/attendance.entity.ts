import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Employee } from '../employees/employee.entity';

export enum CheckType {
  IN = 'in',
  OUT = 'out',
}

@Entity('attendance')
export class Attendance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: CheckType })
  check_type: CheckType;

  @Column({ type: 'timestamptz' })
  check_at: Date; // server-stamped

  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  employee: Employee;

  @Column()
  employee_id: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
