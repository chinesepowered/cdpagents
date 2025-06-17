import {
  BedrockRuntimeClient,
  InvokeModelCommand,
  InvokeModelCommandInput,
} from '@aws-sdk/client-bedrock-runtime';
import { BedrockConfig, BedrockRequest, BedrockResponse } from '@/types';
import config from './config';

export class BedrockService {
  private client: BedrockRuntimeClient | null = null;
  private isConfigured = false;

  constructor(private bedrockConfig?: BedrockConfig) {
    this.bedrockConfig = bedrockConfig || config.bedrock;
    
    if (this.bedrockConfig) {
      this.client = new BedrockRuntimeClient({
        region: this.bedrockConfig.region,
        credentials: {
          accessKeyId: this.bedrockConfig.accessKeyId,
          secretAccessKey: this.bedrockConfig.secretAccessKey,
        },
      });
      this.isConfigured = true;
      console.log('🤖 Amazon Bedrock integration enabled');
    } else {
      console.log('ℹ️  Amazon Bedrock integration disabled (no configuration found)');
    }
  }

  async generateCompletion(request: BedrockRequest): Promise<BedrockResponse> {
    if (!this.isConfigured || !this.client) {
      throw new Error('Amazon Bedrock is not configured. Please set AWS credentials and region.');
    }

    try {
      const modelId = request.modelId || this.bedrockConfig!.modelId;
      
      // Prepare the request payload based on the model
      const payload = this.preparePayload(modelId, request);
      
      const command = new InvokeModelCommand({
        modelId,
        body: JSON.stringify(payload),
        contentType: 'application/json',
        accept: 'application/json',
      });

      const response = await this.client.send(command);
      
      if (!response.body) {
        throw new Error('No response body from Bedrock');
      }

      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      
      return this.parseResponse(modelId, responseBody, request);
    } catch (error) {
      console.error('❌ Bedrock API call failed:', error);
      throw new Error(`Bedrock request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private preparePayload(modelId: string, request: BedrockRequest): any {
    if (modelId.includes('anthropic')) {
      // Claude model payload
      return {
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: request.maxTokens || 1000,
        temperature: request.temperature || 0.7,
        messages: [
          {
            role: 'user',
            content: request.prompt,
          },
        ],
      };
    } else if (modelId.includes('meta')) {
      // Llama model payload
      return {
        prompt: request.prompt,
        max_gen_len: request.maxTokens || 1000,
        temperature: request.temperature || 0.7,
      };
    } else if (modelId.includes('cohere')) {
      // Command model payload
      return {
        prompt: request.prompt,
        max_tokens: request.maxTokens || 1000,
        temperature: request.temperature || 0.7,
      };
    } else {
      // Generic payload
      return {
        inputText: request.prompt,
        textGenerationConfig: {
          maxTokenCount: request.maxTokens || 1000,
          temperature: request.temperature || 0.7,
        },
      };
    }
  }

  private parseResponse(modelId: string, responseBody: any, request: BedrockRequest): BedrockResponse {
    let completion = '';
    let inputTokens = 0;
    let outputTokens = 0;

    if (modelId.includes('anthropic')) {
      // Claude response format
      completion = responseBody.content?.[0]?.text || '';
      inputTokens = responseBody.usage?.input_tokens || 0;
      outputTokens = responseBody.usage?.output_tokens || 0;
    } else if (modelId.includes('meta')) {
      // Llama response format
      completion = responseBody.generation || '';
      inputTokens = responseBody.prompt_token_count || 0;
      outputTokens = responseBody.generation_token_count || 0;
    } else if (modelId.includes('cohere')) {
      // Command response format
      completion = responseBody.generations?.[0]?.text || '';
      inputTokens = responseBody.meta?.billed_units?.input_tokens || 0;
      outputTokens = responseBody.meta?.billed_units?.output_tokens || 0;
    } else {
      // Generic response format
      completion = responseBody.outputText || responseBody.completions?.[0]?.data?.text || '';
      inputTokens = responseBody.inputTextTokenCount || 0;
      outputTokens = responseBody.results?.[0]?.tokenCount || 0;
    }

    // Estimate cost (placeholder - actual costs vary by model)
    const cost = this.estimateCost(modelId, inputTokens, outputTokens);

    return {
      completion,
      inputTokens,
      outputTokens,
      cost: cost.toFixed(6),
    };
  }

  private estimateCost(modelId: string, inputTokens: number, outputTokens: number): number {
    // Rough cost estimates in USD (as of 2024 - check AWS pricing for actual rates)
    const pricing: Record<string, { input: number; output: number }> = {
      'anthropic.claude-3-sonnet-20240229-v1:0': { input: 0.000003, output: 0.000015 },
      'anthropic.claude-3-haiku-20240307-v1:0': { input: 0.00000025, output: 0.00000125 },
      'anthropic.claude-instant-v1': { input: 0.0000008, output: 0.0000024 },
      'meta.llama2-70b-chat-v1': { input: 0.000001, output: 0.000001 },
      'cohere.command-text-v14': { input: 0.0000015, output: 0.000002 },
    };

    const modelPricing = pricing[modelId] || { input: 0.000001, output: 0.000002 };
    
    return inputTokens * modelPricing.input + outputTokens * modelPricing.output;
  }

  // Enhanced AI tool that uses Bedrock
  async createAdvancedAITool() {
    if (!this.isConfigured) {
      return null;
    }

    return {
      name: 'bedrock_ai_completion',
      description: 'Advanced AI completion powered by Amazon Bedrock',
      inputSchema: {
        type: 'object',
        properties: {
          prompt: { 
            type: 'string', 
            description: 'Text prompt for AI completion' 
          },
          maxTokens: { 
            type: 'number', 
            description: 'Maximum tokens to generate (default: 1000)',
            minimum: 1,
            maximum: 4000,
          },
          temperature: { 
            type: 'number', 
            description: 'Temperature for randomness (0.0-1.0, default: 0.7)',
            minimum: 0,
            maximum: 1,
          },
          modelId: {
            type: 'string',
            description: 'Bedrock model ID to use',
            enum: [
              'anthropic.claude-3-sonnet-20240229-v1:0',
              'anthropic.claude-3-haiku-20240307-v1:0',
              'meta.llama2-70b-chat-v1',
              'cohere.command-text-v14',
            ],
          },
        },
        required: ['prompt'],
      },
      handler: async (params: BedrockRequest) => {
        const response = await this.generateCompletion(params);
        return {
          completion: response.completion,
          metadata: {
            model: params.modelId || this.bedrockConfig!.modelId,
            inputTokens: response.inputTokens,
            outputTokens: response.outputTokens,
            estimatedCost: response.cost,
            timestamp: new Date().toISOString(),
          },
        };
      },
      paymentRequired: true,
      paymentConfig: {
        amount: '0.01', // Higher price for premium AI
        currency: 'USDC',
      },
    };
  }

  // Content analysis tool
  async createContentAnalysisTool() {
    if (!this.isConfigured) {
      return null;
    }

    return {
      name: 'bedrock_content_analysis',
      description: 'Analyze content sentiment, topics, and key insights using AI',
      inputSchema: {
        type: 'object',
        properties: {
          content: { 
            type: 'string', 
            description: 'Content to analyze' 
          },
          analysisType: {
            type: 'string',
            description: 'Type of analysis to perform',
            enum: ['sentiment', 'topics', 'summary', 'keywords', 'comprehensive'],
          },
        },
        required: ['content', 'analysisType'],
      },
      handler: async (params: { content: string; analysisType: string }) => {
        const prompts: Record<string, string> = {
          sentiment: `Analyze the sentiment of the following content and provide a detailed breakdown:\n\n${params.content}`,
          topics: `Extract and list the main topics discussed in the following content:\n\n${params.content}`,
          summary: `Provide a concise summary of the following content:\n\n${params.content}`,
          keywords: `Extract the most important keywords and phrases from the following content:\n\n${params.content}`,
          comprehensive: `Provide a comprehensive analysis of the following content including sentiment, main topics, key insights, and summary:\n\n${params.content}`,
        };

        const response = await this.generateCompletion({
          prompt: prompts[params.analysisType] || prompts.comprehensive,
          maxTokens: 500,
          temperature: 0.3,
        });

        return {
          analysisType: params.analysisType,
          result: response.completion,
          metadata: {
            contentLength: params.content.length,
            tokensUsed: response.inputTokens + response.outputTokens,
            cost: response.cost,
            timestamp: new Date().toISOString(),
          },
        };
      },
      paymentRequired: true,
      paymentConfig: {
        amount: '0.05',
        currency: 'USDC',
      },
    };
  }

  // Check if Bedrock is available
  isAvailable(): boolean {
    return this.isConfigured;
  }

  // Get available models
  getAvailableModels(): string[] {
    return [
      'anthropic.claude-3-sonnet-20240229-v1:0',
      'anthropic.claude-3-haiku-20240307-v1:0', 
      'meta.llama2-70b-chat-v1',
      'cohere.command-text-v14',
    ];
  }
}

// Singleton instance
export const bedrockService = new BedrockService();