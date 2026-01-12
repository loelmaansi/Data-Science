import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { ShipmentsService } from '../shipments/shipments.service';
import { DeliveryIssuesService } from '../delivery-issues/delivery-issues.service';
import { EscalationsService } from '../escalations/escalations.service';
import { AgentSessionsService } from '../agent-sessions/agent-sessions.service';

@Injectable()
export class AiOrchestratorService {
  private openai: OpenAI;
  private routerAgent: any;

  constructor(
    private configService: ConfigService,
    private shipmentsService: ShipmentsService,
    private deliveryIssuesService: DeliveryIssuesService,
    private escalationsService: EscalationsService,
    private agentSessionsService: AgentSessionsService,
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }
    this.openai = new OpenAI({ apiKey });
    this.initializeRouterAgent();
  }

  private initializeRouterAgent() {
    // Define tools for agents to call backend APIs
    const tools = [
      {
        type: 'function',
        function: {
          name: 'track_shipment',
          description: 'Track a shipment by tracking number. Returns status, last scan, and ETA.',
          parameters: {
            type: 'object',
            properties: {
              trackingNumber: {
                type: 'string',
                description: 'The tracking number to look up',
              },
            },
            required: ['trackingNumber'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'create_delivery_issue',
          description: 'Create a delivery issue report for a shipment',
          parameters: {
            type: 'object',
            properties: {
              shipmentId: {
                type: 'string',
                description: 'The shipment ID',
              },
              issueType: {
                type: 'string',
                enum: ['damaged', 'missing', 'wrong_address', 'missed_delivery', 'delay', 'other'],
                description: 'Type of issue',
              },
              description: {
                type: 'string',
                description: 'Detailed description of the issue',
              },
            },
            required: ['shipmentId', 'issueType', 'description'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'request_delivery_change',
          description: 'Request a change to delivery (reschedule, update instructions, change address)',
          parameters: {
            type: 'object',
            properties: {
              shipmentId: {
                type: 'string',
                description: 'The shipment ID',
              },
              changeType: {
                type: 'string',
                enum: ['reschedule', 'update_instructions', 'change_address'],
                description: 'Type of change requested',
              },
              newValue: {
                type: 'string',
                description: 'The new value (date, instructions, or address)',
              },
            },
            required: ['shipmentId', 'changeType', 'newValue'],
          },
        },
      },
    ];

    // Router agent configuration
    this.routerAgent = {
      model: 'gpt-4',
      tools,
      tool_choice: 'auto',
    };
  }

  async processChatMessage(
    message: string,
    sessionId: string,
    userId?: string,
  ): Promise<string> {
    try {
      // Get or create agent session by openAiSessionId
      let session = await this.agentSessionsService.findByOpenAiSessionId(sessionId);
      if (!session) {
        const newSession = await this.agentSessionsService.create({
          channel: 'chat' as any,
          openAiSessionId: sessionId,
          role: userId ? 'customer' : 'customer_guest',
        }, userId);
        session = await this.agentSessionsService.findOne(newSession.id);
      }

      if (!message || message.trim().length === 0) {
        return 'Please provide a message.';
      }

      // Call OpenAI API with the message
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a helpful logistics assistant for CallSphere. You help customers track shipments, report issues, and request delivery changes. Use the provided tools to interact with the backend system.`,
          },
          {
            role: 'user',
            content: message,
          },
        ],
        tools: this.routerAgent.tools,
        tool_choice: 'auto',
      });

      const response = completion.choices[0];
      if (!response || !response.message) {
        return 'I apologize, but I could not process your request. Please try again.';
      }

      let responseText = response.message.content || '';

      // Handle tool calls
      if (response.message.tool_calls && response.message.tool_calls.length > 0) {
        for (const toolCall of response.message.tool_calls) {
          try {
            const result = await this.handleToolCall(toolCall, userId);
            responseText += `\n\n${result}`;
          } catch (toolError) {
            console.error('Tool call error:', toolError);
            responseText += `\n\nI encountered an error while processing your request. Please try again.`;
          }
        }
      }

      // Update session transcript
      if (session?.id) {
        await this.agentSessionsService.updateTranscript(session.id, {
          messages: [
            ...((session.transcript as any)?.messages || []),
            { role: 'user', content: message },
            { role: 'assistant', content: responseText },
          ],
        });
      }

      return responseText;
    } catch (error: any) {
      console.error('AI processing error:', error);
      
      // Handle specific OpenAI errors
      if (error?.code === 'invalid_api_key') {
        throw new Error('OpenAI API key is invalid. Please check your configuration.');
      }
      if (error?.code === 'rate_limit_exceeded') {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      if (error?.status === 401) {
        throw new Error('OpenAI API authentication failed. Please check your API key.');
      }
      
      throw new Error(`AI processing error: ${error?.message || 'Unknown error occurred'}`);
    }
  }

  async processVoiceMessage(
    audioData: Buffer,
    sessionId: string,
    userId?: string,
  ): Promise<{ text: string; audio?: Buffer }> {
    try {
      // For voice, we'd use OpenAI Realtime API
      // This is a simplified version - in production, you'd use the Realtime API
      // For now, we'll use the chat API as a placeholder

      // Note: Full Realtime API integration would require WebSocket connection to OpenAI
      // and handling of audio streams. This is a simplified implementation.

      const response = await this.processChatMessage(
        'Voice message processing (placeholder - implement Realtime API)',
        sessionId,
        userId,
      );

      return { text: response };
    } catch (error) {
      throw new Error(`Voice processing error: ${error.message}`);
    }
  }

  private async handleToolCall(toolCall: any, userId?: string): Promise<string> {
    const functionName = toolCall.function.name;
    const args = JSON.parse(toolCall.function.arguments);

    try {
      switch (functionName) {
        case 'track_shipment':
          const shipment = await this.shipmentsService.findByTrackingNumber(
            args.trackingNumber,
            userId,
            'customer',
          );
          return `Shipment ${args.trackingNumber} is ${shipment.currentStatus}. Last scan: ${shipment.lastScanLocation} at ${shipment.lastScanAt}. ETA: ${shipment.promisedDeliveryDate}`;

        case 'create_delivery_issue':
          // Note: In production, userId should come from authenticated context
          const issue = await this.deliveryIssuesService.create(
            {
              shipmentId: args.shipmentId,
              issueType: args.issueType as any,
              description: args.description,
            },
            userId || 'system',
          );
          return `Issue reported successfully. Issue ID: ${issue.id}. Our team will look into this.`;

        case 'request_delivery_change':
          // This would update shipment based on change type
          return `Your delivery change request has been received. Our team will process it shortly.`;

        default:
          return `Unknown tool: ${functionName}`;
      }
    } catch (error) {
      return `Error executing ${functionName}: ${error.message}`;
    }
  }
}

