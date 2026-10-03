import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';

export enum EmployeeRole {
  EMPLOYEE = 'employee',
  ADMIN = 'admin',
}

@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 120 })
  name: string;

  @Column({ length: 160, unique: true })
  company_email: string;

  @Column({ length: 255 })
  @Exclude()
  password_hash: string;

  @Column({ length: 120 })
  position: string;

  @Column({ length: 30, nullable: true })
  phone: string | null;

  @Column({ length: 255, nullable: true })
  photo_url: string | null;

  @Column({ type: 'enum', enum: EmployeeRole, default: EmployeeRole.EMPLOYEE })
  role: EmployeeRole;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
