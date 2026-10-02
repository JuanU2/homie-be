import { Inject, Injectable } from '@nestjs/common';
import { and, asc, desc, eq } from 'drizzle-orm';
import { type NodePgDatabase } from '@homie/db';
import { conversations, messages } from '@/database/schema/index';
import * as schema from '@/database/schema/index';
import type {
  ChatConversation,
  ChatMessage,
  MessageRole,
} from '../domain/entity/chat.entity';
import { IChatRepository } from '../domain/interface/chat.repository';

type ConversationRow = typeof conversations.$inferSelect;
type MessageRow = typeof messages.$inferSelect;

function toConversation(row: ConversationRow): ChatConversation {
  return {
    id: row.id,
    roommateRequestId: row.roommateRequestId,
    sub: row.sub,
    status: row.status as ChatConversation['status'],
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function toMessage(row: MessageRow): ChatMessage {
  return {
    id: row.id,
    conversationId: row.conversationId,
    content: row.content as { text: string },
    role: row.role as MessageRole,
    createdAt: row.createdAt,
  };
}

@Injectable()
export class DrizzleChatRepository implements IChatRepository {
  constructor(
    @Inject('DRIZZLE_DB') private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async findActiveConversation(
    sub: string,
    roommateRequestId: string,
  ): Promise<ChatConversation | null> {
    const [row] = await this.db
      .select()
      .from(conversations)
      .where(
        and(
          eq(conversations.sub, sub),
          eq(conversations.roommateRequestId, roommateRequestId),
          eq(conversations.status, 'ACTIVE'),
        ),
      )
      .limit(1);

    return row ? toConversation(row) : null;
  }

  async findConversationById(id: string): Promise<ChatConversation | null> {
    const [row] = await this.db
      .select()
      .from(conversations)
      .where(eq(conversations.id, id))
      .limit(1);

    return row ? toConversation(row) : null;
  }

  async startConversation(
    sub: string,
    roommateRequestId: string,
  ): Promise<ChatConversation> {
    return this.db.transaction(async (tx) => {
      await tx
        .update(conversations)
        .set({ status: 'CLOSED', updatedAt: new Date() })
        .where(
          and(
            eq(conversations.sub, sub),
            eq(conversations.roommateRequestId, roommateRequestId),
            eq(conversations.status, 'ACTIVE'),
          ),
        );

      const [row] = await tx
        .insert(conversations)
        .values({ roommateRequestId, sub })
        .returning();

      return toConversation(row);
    });
  }

  async addMessage(
    conversationId: string,
    role: MessageRole,
    content: ChatMessage['content'],
  ): Promise<ChatMessage> {
    const [row] = await this.db
      .insert(messages)
      .values({ conversationId, role, content })
      .returning();

    return toMessage(row);
  }

  async listMessages(conversationId: string): Promise<ChatMessage[]> {
    const rows = await this.db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(asc(messages.createdAt), asc(messages.id));

    return rows.map(toMessage);
  }

  async listRecentUserMessages(
    conversationId: string,
    limit: number,
  ): Promise<ChatMessage[]> {
    const rows = await this.db
      .select()
      .from(messages)
      .where(
        and(
          eq(messages.conversationId, conversationId),
          eq(messages.role, 'USER'),
        ),
      )
      .orderBy(desc(messages.createdAt), desc(messages.id))
      .limit(limit);

    return rows.reverse().map(toMessage);
  }
}
