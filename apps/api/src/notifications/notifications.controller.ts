import { Controller, MessageEvent, Sse } from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Sse('stream')
  stream(): Observable<MessageEvent> {
    return this.notificationsService.stream().pipe(
      map((notification) => ({
        type: notification.type,
        data: notification.data,
      })),
    );
  }
}
