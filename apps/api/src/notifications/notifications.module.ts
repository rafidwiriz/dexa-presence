import { Module } from '@nestjs/common';
import { NotificationsConsumer } from './notifications.consumer';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

@Module({
  controllers: [NotificationsController, NotificationsConsumer],
  providers: [NotificationsService],
})
export class NotificationsModule {}
