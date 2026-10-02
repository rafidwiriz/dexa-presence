import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileChange } from './profile-change.entity';
import { ProfileAuditConsumer } from './profile-audit.consumer';

@Module({
  imports: [TypeOrmModule.forFeature([ProfileChange], 'audit')],
  controllers: [ProfileAuditConsumer],
})
export class ProfileAuditModule {}
