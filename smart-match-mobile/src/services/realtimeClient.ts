import { Client, IMessage } from '@stomp/stompjs';
import { Platform } from 'react-native';
import { firebaseAuth } from '../auth/firebase';
import { WS_URL } from '../config/env';
import { Message, Notification } from '../types';

type MessageHandler = (message: Message) => void;
type NotificationHandler = (notification: Notification) => void;

/**
 * Singleton STOMP client over the native React Native WebSocket. Authenticates the
 * CONNECT frame with the current Firebase ID token and fans incoming frames out to
 * registered listeners.
 */
class RealtimeClient {
  private client: Client | null = null;
  private messageHandlers = new Set<MessageHandler>();
  private notificationHandlers = new Set<NotificationHandler>();
  private connectAttempted = false;

  async connect() {
    if (this.client?.active) return;
    const user = firebaseAuth.currentUser;
    if (!user) return;

    let token: string;
    try {
      token = await user.getIdToken();
    } catch {
      return;
    }

    this.client = new Client({
      webSocketFactory: () => new WebSocket(WS_URL),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        this.connectAttempted = true;
        this.client?.subscribe('/user/queue/messages', (frame: IMessage) => {
          const message = JSON.parse(frame.body) as Message;
          this.messageHandlers.forEach((handler) => handler(message));
        });
        this.client?.subscribe('/user/queue/notifications', (frame: IMessage) => {
          const notification = JSON.parse(frame.body) as Notification;
          this.notificationHandlers.forEach((handler) => handler(notification));
        });
      },
      onStompError: () => {
        this.stopReconnect();
      },
      onWebSocketClose: () => {
        if (!this.connectAttempted && Platform.OS === 'web') {
          this.stopReconnect();
        }
      }
    });
    this.client.activate();
  }

  private stopReconnect() {
    if (this.client) {
      this.client.reconnectDelay = 0;
      this.client.deactivate();
      this.client = null;
    }
  }

  disconnect() {
    this.connectAttempted = false;
    this.client?.deactivate();
    this.client = null;
  }

  sendMessage(conversationId: string, content: string) {
    this.client?.publish({
      destination: '/app/chat.send',
      body: JSON.stringify({ conversationId, content })
    });
  }

  onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.add(handler);
    return () => { this.messageHandlers.delete(handler); };
  }

  onNotification(handler: NotificationHandler): () => void {
    this.notificationHandlers.add(handler);
    return () => { this.notificationHandlers.delete(handler); };
  }
}

export const realtimeClient = new RealtimeClient();
