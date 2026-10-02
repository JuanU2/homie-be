import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const sendMessageBodySchema = z.object({
  roommateRequestId: z.uuid(),
  conversationId: z.uuid().optional(),
  content: z.string().min(1),
});

export class SendMessageBodyDto extends createZodDto(sendMessageBodySchema) {}

export const conversationParamsSchema = z.object({
  roommateRequestId: z.uuid(),
});

export class ConversationParamsDto extends createZodDto(
  conversationParamsSchema,
) {}

export interface ChatMessageResponse {
  id: string;
  content: string;
  createdAt: string;
}

export interface SendMessageResponse {
  conversationId: string;
  clientMessage: ChatMessageResponse;
  response: ChatMessageResponse;
}

export interface GetConversationResponse {
  id: string;
  messages: Array<{
    content: string;
    role: 'USER' | 'AGENT';
    createdAt: string;
  }>;
}
