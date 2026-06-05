import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';

export interface AssistantChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

export interface AssistantChatResponse {
  answer: string;
  thinking?: string | null;
  sources?: string[] | null;
}

@Injectable({ providedIn: 'root' })
export class AssistantService {
  private readonly api = inject(ApiService);

  /** Ask the Interlance RAG assistant. sessionId keys the n8n conversation memory. */
  chat(question: string, history: AssistantChatTurn[], sessionId: string) {
    return this.api.post<AssistantChatResponse>('/assistant/chat', { question, history, sessionId });
  }
}
