export type ConversationStatus = 'ACTIVE' | 'CLOSED';
export type MessageRole = 'USER' | 'AGENT';

export interface ChatConversation {
  id: string;
  roommateRequestId: string;
  sub: string;
  status: ConversationStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  content: { text: string };
  role: MessageRole;
  createdAt: Date;
}
