import { Injectable } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';
import { ProfileUpdatedEvent } from '../profile-audit/profile-audit.consumer';

@Injectable()
export class NotificationsService {
  private readonly subject = new Subject<{
    type: string;
    data: ProfileUpdatedEvent;
  }>();

  publish(notification: { type: string; data: ProfileUpdatedEvent }): void {
    this.subject.next(notification);
  }

  stream(): Observable<{ type: string; data: ProfileUpdatedEvent }> {
    return this.subject.asObservable();
  }
}
