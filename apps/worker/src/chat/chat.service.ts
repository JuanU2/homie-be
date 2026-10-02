import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AI_API_SERVICE,
  type IAiApiService,
} from '@/ai/domain/interface/ai-api.service';
import {
  ROOMMATE_REQUESTS_REPOSITORY,
  type IRoommateRequestsRepository,
} from '@/roommate-requests/domain/interface/roommate-requests.repository';
import type { ChatMessage } from './domain/entity/chat.entity';
import {
  CHAT_REPOSITORY,
  type IChatRepository,
} from './domain/interface/chat.repository';
import { buildChatPrompt } from './chat.prompt';
import type {
  ChatMessageResponse,
  GetConversationResponse,
  SendMessageBodyDto,
  SendMessageResponse,
} from './dtos/chat.dto';

const RECENT_USER_MESSAGE_LIMIT = 5;

@Injectable()
export class ChatService {
  constructor(
    @Inject(AI_API_SERVICE) private readonly aiApi: IAiApiService,
    @Inject(CHAT_REPOSITORY)
    private readonly chatRepository: IChatRepository,
    @Inject(ROOMMATE_REQUESTS_REPOSITORY)
    private readonly roommateRequestsRepository: IRoommateRequestsRepository,
  ) {}

  async sendMessage(
    sub: string,
    dto: SendMessageBodyDto,
  ): Promise<SendMessageResponse> {
    const roommateRequest = await this.roommateRequestsRepository.findById(
      dto.roommateRequestId,
    );
    if (!roommateRequest) {
      throw new NotFoundException('Roommate request not found');
    }

    let conversationId: string;

    if (dto.conversationId) {
      const conversation = await this.chatRepository.findConversationById(
        dto.conversationId,
      );
      if (!conversation) {
        throw new NotFoundException('Conversation not found');
      }
      if (conversation.sub !== sub) {
        throw new ForbiddenException(
          'Conversation does not belong to the user',
        );
      }
      if (conversation.status !== 'ACTIVE') {
        throw new ConflictException('Conversation is not active');
      }
      if (conversation.roommateRequestId !== dto.roommateRequestId) {
        throw new BadRequestException(
          'Conversation does not match the roommate request',
        );
      }
      conversationId = conversation.id;
    } else {
      const conversation = await this.chatRepository.startConversation(
        sub,
        dto.roommateRequestId,
      );
      conversationId = conversation.id;
    }

    const clientMessage = await this.chatRepository.addMessage(
      conversationId,
      'USER',
      { text: dto.content },
    );

    const recentUserMessages = await this.chatRepository.listRecentUserMessages(
      conversationId,
      RECENT_USER_MESSAGE_LIMIT,
    );
    const prompt = buildChatPrompt({
      roommateRequest,
      userMessages: recentUserMessages.map((m) => m.content.text),
    });

    const reply = await this.aiApi.generateText(prompt);

    const agentMessage = await this.chatRepository.addMessage(
      conversationId,
      'AGENT',
      { text: reply },
    );

    return {
      conversationId,
      clientMessage: toMessageResponse(clientMessage),
      response: toMessageResponse(agentMessage),
    };
  }

  async getActiveConversation(
    sub: string,
    roommateRequestId: string,
  ): Promise<GetConversationResponse> {
    const conversation = await this.chatRepository.findActiveConversation(
      sub,
      roommateRequestId,
    );
    if (!conversation) {
      throw new NotFoundException(
        'No active conversation for this roommate request',
      );
    }

    const messages = await this.chatRepository.listMessages(conversation.id);

    return {
      id: conversation.id,
      messages: messages.map((m) => ({
        content: m.content.text,
        role: m.role,
        createdAt: m.createdAt.toISOString(),
      })),
    };
  }
}

function toMessageResponse(message: ChatMessage): ChatMessageResponse {
  return {
    id: message.id,
    content: message.content.text,
    createdAt: message.createdAt.toISOString(),
  };
}
