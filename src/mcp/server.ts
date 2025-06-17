#!/usr/bin/env node

// Mock MCP SDK types for development
interface MockServer {
  setRequestHandler(schema: any, handler: any): void;
  connect(transport: any): Promise<void>;
}

interface MockTransport {
  start(): Promise<void>;
}

// Mock implementations
const createMockServer = (info: any, capabilities: any): MockServer => ({
  setRequestHandler: (schema: any, handler: any) => {
    console.log(`📝 Registered handler for ${schema.type || 'unknown'}`);
  },
  connect: async (transport: any) => {
    console.log('🔌 Connected to transport');
  },
});

const createMockTransport = (): MockTransport => ({
  start: async () => {
    console.log('🚀 Transport started');
  },
});

import { MCPTool, MCPServerConfig, MCPRequest, MCPResponse } from '../types';
import { x402Payment } from '../lib/x402-payment';
import { cdpWallet } from '../lib/cdp-wallet';
import config from '../lib/config';
import { createHash } from 'crypto';
import chalk from 'chalk';

class MonetizedMCPServer {
  private server: MockServer;
  private tools: Map<string, MCPTool> = new Map();
  private serverConfig: MCPServerConfig;
  private usageMetrics: Map<string, number> = new Map();
  private revenueMetrics: Map<string, number> = new Map();

  constructor(serverConfig: MCPServerConfig) {
    this.serverConfig = serverConfig;
    this.server = createMockServer(
      {
        name: serverConfig.name,
        version: serverConfig.version,
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
    this.registerTools(serverConfig.tools);
  }

  private setupHandlers(): void {
    // List available tools
    this.server.setRequestHandler({ type: 'tools/list' }, async () => {
      const tools = Array.from(this.tools.values()).map(tool => ({
        name: tool.name,
        description: tool.paymentRequired 
          ? `${tool.description} (💰 ${tool.paymentConfig?.amount || config.payments.defaultAmount} ${tool.paymentConfig?.currency || config.payments.currency})`
          : tool.description,
        inputSchema: tool.inputSchema,
      }));

      return { tools };
    });

    // Handle tool calls with payment verification
    this.server.setRequestHandler({ type: 'tools/call' }, async (request: any) => {
      const { name, arguments: args } = request.params;
      const tool = this.tools.get(name);

      if (!tool) {
        throw new Error(`Unknown tool: ${name}`);
      }

      // Check if payment is required
      if (tool.paymentRequired === true && this.serverConfig.paymentConfig.enabled) {
        const paymentVerification = await this.verifyPayment(request, tool);
        
        if (!paymentVerification.valid) {
          // Return 402 Payment Required equivalent for MCP
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  error: 'Payment Required',
                  code: 402,
                  message: 'This tool requires payment to use',
                  payment: paymentVerification.paymentInstruction,
                }),
              },
            ],
            isError: true,
          };
        }
      }

      try {
        // Execute the tool
        const result = await tool.handler(args);
        
        // Track usage metrics
        this.trackUsage(name, tool.paymentRequired === true);
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        console.error(`❌ Tool ${name} failed:`, error);
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                error: 'Tool execution failed',
                message: error instanceof Error ? error.message : 'Unknown error',
              }),
            },
          ],
          isError: true,
        };
      }
    });
  }

  private registerTools(tools: MCPTool[]): void {
    tools.forEach(tool => {
      this.tools.set(tool.name, tool);
      console.log(chalk.green(`✅ Registered tool: ${tool.name}${tool.paymentRequired ? ' (💰 paid)' : ' (🆓 free)'}`));
    });
  }

  private async verifyPayment(
    request: any,
    tool: MCPTool
  ): Promise<{ valid: boolean; paymentInstruction?: any }> {
    // Check for payment proof in request metadata
    const paymentProof = request.meta?.paymentProof;
    
    if (!paymentProof) {
      // No payment provided, generate payment instruction
      const amount = tool.paymentConfig?.amount || config.payments.defaultAmount;
      const currency = tool.paymentConfig?.currency || config.payments.currency;
      
      const paymentInstruction = x402Payment.generatePaymentInstruction(
        amount,
        currency,
        `Payment for ${tool.name} tool`,
        {
          toolName: tool.name,
          requestId: this.generateRequestId(request),
        }
      );

      return {
        valid: false,
        paymentInstruction,
      };
    }

    // Verify payment proof
    const verification = await x402Payment.verifyPayment(
      this.generateRequestId(request),
      paymentProof
    );

    return { valid: verification.valid };
  }

  private generateRequestId(request: any): string {
    const requestData = JSON.stringify(request);
    return createHash('sha256').update(requestData).digest('hex').substring(0, 16);
  }

  private trackUsage(toolName: string, wasPaid: boolean): void {
    // Track usage count
    const currentUsage = this.usageMetrics.get(toolName) || 0;
    this.usageMetrics.set(toolName, currentUsage + 1);

    // Track revenue if paid
    if (wasPaid) {
      const tool = this.tools.get(toolName);
      const amount = parseFloat(tool?.paymentConfig?.amount || config.payments.defaultAmount);
      const currentRevenue = this.revenueMetrics.get(toolName) || 0;
      this.revenueMetrics.set(toolName, currentRevenue + amount);
    }

    // Log metrics
    console.log(chalk.cyan(`📊 ${toolName}: ${this.usageMetrics.get(toolName)} uses, $${(this.revenueMetrics.get(toolName) || 0).toFixed(4)} revenue`));
  }

  public getMetrics() {
    return {
      usage: Object.fromEntries(this.usageMetrics),
      revenue: Object.fromEntries(this.revenueMetrics),
    };
  }

  public async start(): Promise<void> {
    console.log(chalk.blue(`🚀 Starting ${this.serverConfig.name} v${this.serverConfig.version}`));
    
    // Initialize CDP wallet if payments are enabled
    if (this.serverConfig.paymentConfig.enabled) {
      console.log(chalk.yellow('💰 Initializing CDP wallet...'));
      await cdpWallet.initialize();
    }

    const transport = createMockTransport();
    await this.server.connect(transport);
    
    console.log(chalk.green(`✅ MCP server running with ${this.tools.size} tools`));
    console.log(chalk.green(`   Payment enabled: ${this.serverConfig.paymentConfig.enabled ? '✅' : '❌'}`));
  }
}

// Example tool implementations
const exampleTools: MCPTool[] = [
  {
    name: 'echo',
    description: 'Echo back the input message',
    inputSchema: {
      type: 'object',
      properties: {
        message: { type: 'string', description: 'Message to echo' },
      },
      required: ['message'],
    },
    handler: async (params) => {
      return { echo: params.message, timestamp: new Date().toISOString() };
    },
    paymentRequired: false,
  },
  {
    name: 'premium_analysis',
    description: 'Perform premium data analysis',
    inputSchema: {
      type: 'object',
      properties: {
        data: { type: 'array', description: 'Data to analyze' },
        analysisType: { type: 'string', description: 'Type of analysis' },
      },
      required: ['data', 'analysisType'],
    },
    handler: async (params) => {
      // Simulate premium analysis
      const result = {
        analysis: `Premium ${params.analysisType} analysis`,
        dataPoints: params.data.length,
        insights: [
          'High-value insight 1',
          'Premium pattern detected',
          'Advanced correlation found',
        ],
        timestamp: new Date().toISOString(),
      };
      return result;
    },
    paymentRequired: true,
    paymentConfig: {
      amount: '0.05',
      currency: 'USDC',
    },
  },
  {
    name: 'market_data',
    description: 'Get real-time market data',
    inputSchema: {
      type: 'object',
      properties: {
        symbol: { type: 'string', description: 'Market symbol (e.g., BTC, ETH)' },
        interval: { type: 'string', description: 'Data interval' },
      },
      required: ['symbol'],
    },
    handler: async (params) => {
      // Simulate market data
      return {
        symbol: params.symbol,
        price: Math.random() * 50000 + 1000,
        change24h: (Math.random() - 0.5) * 10,
        volume: Math.random() * 1000000,
        timestamp: new Date().toISOString(),
      };
    },
    paymentRequired: true,
    paymentConfig: {
      amount: '0.02',
      currency: 'USDC',
    },
  },
  {
    name: 'ai_completion',
    description: 'Generate AI text completion',
    inputSchema: {
      type: 'object',
      properties: {
        prompt: { type: 'string', description: 'Text prompt' },
        maxTokens: { type: 'number', description: 'Maximum tokens to generate' },
      },
      required: ['prompt'],
    },
    handler: async (params) => {
      // Simulate AI completion (could integrate with Bedrock here)
      const completions = [
        'This is a simulated AI completion for your prompt.',
        'Artificial intelligence has many applications in modern technology.',
        'The future of AI looks promising with continued advancement.',
      ];
      
      return {
        completion: completions[Math.floor(Math.random() * completions.length)],
        tokens: params.maxTokens || 100,
        model: 'simulated-ai-model',
        timestamp: new Date().toISOString(),
      };
    },
    paymentRequired: true,
    paymentConfig: {
      amount: '0.001',
      currency: 'USDC',
    },
  },
];

// Server configuration
const serverConfig: MCPServerConfig = {
  name: 'monetized-mcp-server',
  version: '1.0.0',
  description: 'Example monetized MCP server with x402 and CDP Wallet',
  port: config.mcp.port,
  tools: exampleTools,
  paymentConfig: {
    enabled: true,
    defaultAmount: config.payments.defaultAmount,
    currency: config.payments.currency,
    wallet: config.cdp,
  },
  x402Config: config.x402,
};

// Start server if run directly
if (require.main === module) {
  const server = new MonetizedMCPServer(serverConfig);
  
  server.start().catch((error) => {
    console.error(chalk.red('❌ Failed to start MCP server:'), error);
    process.exit(1);
  });
}

export { MonetizedMCPServer };