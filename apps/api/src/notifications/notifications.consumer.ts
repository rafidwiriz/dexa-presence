import { Controller, Logger } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { ProfileUpdatedEvent } from '../profile-audit/profile-audit.consumer';
import { NotificationsService } from './notifications.service';

@Controller()
export class NotificationsConsumer {
  private readonly logger = new Logger(NotificationsConsumer.name);

  constructor(private readonly notificationsService: NotificationsService) {}

  @EventPattern('profile.updated')
  handleProfileUpdated(data: ProfileUpdatedEvent): void {
    this.notificationsService.publish({ type: 'profile.updated', data });
    this.logger.log(
      `Broadcast profile.updated for employee ${data.employeeId} to SSE subscribers`,
    );
  }
}
