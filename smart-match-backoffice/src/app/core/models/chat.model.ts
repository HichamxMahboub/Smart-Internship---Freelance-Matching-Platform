export interface Conversation {
  id: string;
  candidateId: string;
  recruiterId: string;
  offerId?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unread: number;
  createdAt?: string;
  displayName?: string;
  displayAvatarUrl?: string;
  offerTitle?: string;
  companyName?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  read: boolean;
  createdAt?: string;
}
