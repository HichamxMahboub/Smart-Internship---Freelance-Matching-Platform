import { Injectable, inject } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import { Subject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { Message } from '../models/chat.model';
import { Notification } from '../models/notification.model';

/**
 * STOMP client over the browser WebSocket. Authenticates the CONNECT frame with the
 * current Firebase ID token and exposes incoming messages/notifications as RxJS streams.
 */
@Injectable({ providedIn: 'root' })
export class RealtimeService {
  private readonly auth = inject(AuthService);
  private client: Client | null = null;

  readonly messages$ = new Subject<Message>();
  readonly notifications$ = new Subject<Notification>();

  async connect() {
    if (this.client?.active) return;
    const firebaseUser = this.auth.firebaseUser;
    if (!firebaseUser) return;
    const token = await firebaseUser.getIdToken();

    this.client = new Client({
      webSocketFactory: () => new WebSocket(environment.wsUrl),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      onConnect: () => {
        this.client?.subscribe('/user/queue/messages', (frame: IMessage) => {
          this.messages$.next(JSON.parse(frame.body) as Message);
        });
        this.client?.subscribe('/user/queue/notifications', (frame: IMessage) => {
          this.notifications$.next(JSON.parse(frame.body) as Notification);
        });
      }
    });
    this.client.activate();
  }

  disconnect() {
    this.client?.deactivate();
    this.client = null;
  }
}
