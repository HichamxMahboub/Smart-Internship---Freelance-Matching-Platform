import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Conversation, Message } from '../models/chat.model';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly api = inject(ApiService);

  conversations() { return this.api.get<Conversation[]>('/conversations'); }
  start(offerId: string, candidateId?: string) { return this.api.post<Conversation>('/conversations', { offerId, candidateId }); }
  messages(conversationId: string) { return this.api.get<Message[]>(`/conversations/${conversationId}/messages`); }
  send(conversationId: string, content: string) { return this.api.post<Message>(`/conversations/${conversationId}/messages`, { content }); }
}
