import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import type { Request } from 'express';
import { GoogleTokenGuard } from '@/auth/google-token.guard';
import { ChatService } from './chat.service';
import {
  ConversationParamsDto,
  type GetConversationResponse,
  SendMessageBodyDto,
  type SendMessageResponse,
} from './dtos/chat.dto';

@Controller()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('ai/messages')
  @UseGuards(GoogleTokenGuard)
  @ApiOperation({ summary: 'Send a chat message and get the AI reply' })
  async sendMessage(
    @Req() req: Request,
    @Body() dto: SendMessageBodyDto,
  ): Promise<SendMessageResponse> {
    return this.chatService.sendMessage(req.user!.sub, dto);
  }

  @Get('conversations/:roommateRequestId')
  @UseGuards(GoogleTokenGuard)
  @ApiOperation({
    summary: 'Get the active conversation for a roommate request',
  })
  async getActiveConversation(
    @Req() req: Request,
    @Param() params: ConversationParamsDto,
  ): Promise<GetConversationResponse> {
    return this.chatService.getActiveConversation(
      req.user!.sub,
      params.roommateRequestId,
    );
  }
}
