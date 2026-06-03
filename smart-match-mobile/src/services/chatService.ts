import { apiClient } from '../api/apiClient';
import { Conversation, Message } from '../types';

export const chatService = {
  async conversations() {
    const { data } = await apiClient.get<Conversation[]>('/conversations');
    return data;
  },
  async start(offerId: string, candidateId?: string) {
    const { data } = await apiClient.post<Conversation>('/conversations', { offerId, candidateId });
    return data;
  },
  async messages(conversationId: string) {
    const { data } = await apiClient.get<Message[]>(`/conversations/${conversationId}/messages`);
    return data;
  },
  async send(conversationId: string, content: string) {
    const { data } = await apiClient.post<Message>(`/conversations/${conversationId}/messages`, { content });
    return data;
  }
};
