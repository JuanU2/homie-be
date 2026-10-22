import { Module } from '@nestjs/common';
import { AiModule } from '@/ai/ai.module';
import { ListingsModule } from '@/listings/listings.module';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { DrizzleChatRepository } from './infrastructure/drizzle-chat.repository';
import { CHAT_REPOSITORY } from './domain/interface/chat.repository';

@Module({
  imports: [AiModule, ListingsModule],
  controllers: [ChatController],
  providers: [
    ChatService,
    { provide: CHAT_REPOSITORY, useClass: DrizzleChatRepository },
  ],
})
export class ChatModule {}
