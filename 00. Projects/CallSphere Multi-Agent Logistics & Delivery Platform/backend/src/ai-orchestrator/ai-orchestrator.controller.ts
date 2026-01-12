import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AiOrchestratorService } from './ai-orchestrator.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('ai')
export class AiOrchestratorController {
  constructor(private readonly aiOrchestratorService: AiOrchestratorService) {}

  @Post('chat/:sessionId')
  @UseGuards(JwtAuthGuard)
  async processChat(
    @Param('sessionId') sessionId: string,
    @Body('message') message: string,
    @CurrentUser() user: any,
  ) {
    try {
      if (!message || message.trim().length === 0) {
        return { error: 'Message is required' };
      }

      const response = await this.aiOrchestratorService.processChatMessage(
        message,
        sessionId,
        user?.id,
      );
      return { response };
    } catch (error: any) {
      console.error('Chat error:', error);
      return {
        error: error.message || 'Failed to process chat message',
        response: 'I apologize, but I encountered an error. Please try again.',
      };
    }
  }

  @Post('voice/:sessionId')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('audio'))
  async processVoice(
    @Param('sessionId') sessionId: string,
    @UploadedFile() audio: Express.Multer.File,
    @CurrentUser() user: any,
  ) {
    if (!audio) {
      return { error: 'No audio file provided' };
    }
    const result = await this.aiOrchestratorService.processVoiceMessage(
      audio.buffer,
      sessionId,
      user?.id,
    );
    return result;
  }
}

