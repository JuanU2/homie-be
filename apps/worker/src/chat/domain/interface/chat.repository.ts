import type {
  ChatConversation,
  ChatMessage,
  MessageRole,
} from '../entity/chat.entity';

export interface IChatRepository {
  findActiveConversation(
    sub: string,
    roommateRequestId: string,
  ): Promise<ChatConversation | null>;
  findConversationById(id: string): Promise<ChatConversation | null>;
  startConversation(
    sub: string,
    roommateRequestId: string,
  ): Promise<ChatConversation>;
  addMessage(
    conversationId: string,
    role: MessageRole,
    content: ChatMessage['content'],
  ): Promise<ChatMessage>;
  listMessages(conversationId: string): Promise<ChatMessage[]>;
  listRecentUserMessages(
    conversationId: string,
    limit: number,
  ): Promise<ChatMessage[]>;
}

export const CHAT_REPOSITORY = Symbol('CHAT_REPOSITORY');
