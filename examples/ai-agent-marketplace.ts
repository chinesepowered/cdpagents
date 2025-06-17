/**
 * AI Agent Marketplace Example
 * 
 * Demonstrates how to create an AI agent marketplace where:
 * - Agents charge users per query
 * - Revenue is automatically split between agent creators and contributors
 * - Usage-based pricing for different AI models
 */

import { MonetizedMCPServer } from '../src/mcp/server';
import { MCPTool, MCPServerConfig } from '../src/types';
import { bedrockService } from '../src/lib/bedrock-integration';
import { cdpWallet } from '../src/lib/cdp-wallet';

// Define AI agents as monetized tools
const aiAgents: MCPTool[] = [
  {
    name: 'coding_assistant',
    description: 'AI assistant specialized in code generation and debugging',
    inputSchema: {
      type: 'object',
      properties: {
        task: { type: 'string', description: 'Coding task description' },
        language: { type: 'string', description: 'Programming language' },
        difficulty: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'] },
      },
      required: ['task', 'language'],
    },
    handler: async (params) => {
      const prompt = `You are an expert programmer. Help with this ${params.difficulty || 'intermediate'} ${params.language} task: ${params.task}`;
      
      // Use Bedrock if available, otherwise simulate
      if (bedrockService.isAvailable()) {
        const response = await bedrockService.generateCompletion({
          prompt,
          maxTokens: 1000,
          temperature: 0.3,
        });
        return {
          code: response.completion,
          metadata: {
            model: 'bedrock-ai',
            tokens: response.inputTokens + response.outputTokens,
            cost: response.cost,
          },
        };
      } else {
        return {
          code: `// Simulated ${params.language} solution for: ${params.task}\n\nfunction solution() {\n    // Implementation here\n    return "Task completed";\n}`,
          metadata: { model: 'simulated', tokens: 150, cost: '0.001' },
        };
      }
    },
    paymentRequired: true,
    paymentConfig: {
      amount: '0.10', // $0.10 per coding query
      currency: 'USDC',
    },
  },
  
  {
    name: 'data_scientist',
    description: 'AI data scientist for analysis and insights',
    inputSchema: {
      type: 'object',
      properties: {
        data: { type: 'array', description: 'Dataset to analyze' },
        analysisType: { 
          type: 'string', 
          enum: ['summary', 'correlation', 'prediction', 'anomaly_detection'],
          description: 'Type of analysis to perform'
        },
        visualizations: { type: 'boolean', description: 'Include visualizations' },
      },
      required: ['data', 'analysisType'],
    },
    handler: async (params) => {
      const analysisMap = {
        summary: 'Statistical summary and descriptive analytics',
        correlation: 'Correlation analysis between variables',
        prediction: 'Predictive modeling and forecasting',
        anomaly_detection: 'Outlier detection and anomaly analysis',
      };
      
      const analysis = {
        type: params.analysisType,
        description: analysisMap[params.analysisType as keyof typeof analysisMap],
        dataPoints: params.data.length,
        insights: [
          `${params.analysisType} analysis completed`,
          'Key patterns identified in the dataset',
          'Recommendations for further investigation',
        ],
        visualizations: params.visualizations ? ['scatter_plot', 'histogram', 'correlation_matrix'] : [],
        timestamp: new Date().toISOString(),
      };
      
      return analysis;
    },
    paymentRequired: true,
    paymentConfig: {
      amount: '0.25', // $0.25 per data analysis
      currency: 'USDC',
    },
  },
  
  {
    name: 'creative_writer',
    description: 'AI creative writing assistant for stories and content',
    inputSchema: {
      type: 'object',
      properties: {
        genre: { type: 'string', description: 'Writing genre (sci-fi, fantasy, etc.)' },
        prompt: { type: 'string', description: 'Writing prompt or idea' },
        length: { type: 'string', enum: ['short', 'medium', 'long'], description: 'Desired length' },
        style: { type: 'string', description: 'Writing style preference' },
      },
      required: ['genre', 'prompt'],
    },
    handler: async (params) => {
      const lengthMap = { short: 100, medium: 300, long: 500 };
      const targetWords = lengthMap[params.length as keyof typeof lengthMap] || 300;
      
      const story = {
        title: `A ${params.genre} Story`,
        content: `This is a ${params.length || 'medium'} ${params.genre} story based on: "${params.prompt}"\n\n[Story content would be generated here using AI...]`,
        metadata: {
          genre: params.genre,
          style: params.style || 'narrative',
          wordCount: targetWords,
          estimatedReadingTime: Math.ceil(targetWords / 200),
        },
        timestamp: new Date().toISOString(),
      };
      
      return story;
    },
    paymentRequired: true,
    paymentConfig: {
      amount: '0.15', // $0.15 per creative writing request
      currency: 'USDC',
    },
  },
  
  {
    name: 'market_analyst',
    description: 'AI market analysis and trading insights',
    inputSchema: {
      type: 'object',
      properties: {
        symbols: { type: 'array', items: { type: 'string' }, description: 'Asset symbols to analyze' },
        analysisType: { 
          type: 'string', 
          enum: ['technical', 'fundamental', 'sentiment', 'combined'],
          description: 'Type of market analysis'
        },
        timeframe: { type: 'string', description: 'Analysis timeframe (1d, 1w, 1m, etc.)' },
      },
      required: ['symbols', 'analysisType'],
    },
    handler: async (params) => {
      const analysis = {
        symbols: params.symbols,
        analysisType: params.analysisType,
        timeframe: params.timeframe || '1d',
        insights: params.symbols.map((symbol: string) => ({
          symbol,
          price: Math.random() * 1000 + 100,
          change24h: (Math.random() - 0.5) * 20,
          recommendation: ['BUY', 'HOLD', 'SELL'][Math.floor(Math.random() * 3)],
          confidence: Math.random() * 0.4 + 0.6, // 60-100%
          signals: [
            'Moving average crossover detected',
            'Volume spike identified',
            'Support level holding strong',
          ],
        })),
        marketSentiment: 'Bullish',
        riskLevel: 'Medium',
        timestamp: new Date().toISOString(),
      };
      
      return analysis;
    },
    paymentRequired: true,
    paymentConfig: {
      amount: '0.20', // $0.20 per market analysis
      currency: 'USDC',
    },
  },
];

// Revenue distribution configuration for the marketplace
const revenueDistribution = {
  // Agent creator gets the majority
  creator: { percentage: 60 },
  // Contributors get a share
  contributors: { percentage: 15 },
  // Platform takes a fee
  platform: { percentage: 20 },
  // Network fees
  network: { percentage: 5 },
};

// Custom revenue distribution handler
async function distributeMarketplaceRevenue(
  agentName: string,
  amount: string,
  currency: string,
  creatorAddress: string,
  contributorAddresses: string[] = []
) {
  const totalAmount = parseFloat(amount);
  
  // Calculate distributions
  const creatorAmount = totalAmount * (revenueDistribution.creator.percentage / 100);
  const platformAmount = totalAmount * (revenueDistribution.platform.percentage / 100);
  const contributorsAmount = totalAmount * (revenueDistribution.contributors.percentage / 100);
  
  const distributions = [
    {
      address: creatorAddress,
      amount: creatorAmount.toFixed(6),
      label: 'Agent Creator',
    },
    {
      address: process.env.PLATFORM_WALLET_ADDRESS || creatorAddress,
      amount: platformAmount.toFixed(6),
      label: 'Platform Fee',
    },
  ];
  
  // Split contributor amount equally among contributors
  if (contributorAddresses.length > 0) {
    const perContributor = contributorsAmount / contributorAddresses.length;
    contributorAddresses.forEach((address, index) => {
      distributions.push({
        address,
        amount: perContributor.toFixed(6),
        label: `Contributor ${index + 1}`,
      });
    });
  }
  
  // Execute distributions
  const results = [];
  for (const dist of distributions) {
    const result = await cdpWallet.sendPayment(dist.address, dist.amount, currency);
    results.push({ ...dist, success: result.success, transactionId: result.transactionId });
  }
  
  console.log(`💰 Revenue distributed for ${agentName}:`, results);
  return results;
}

// Create the AI Agent Marketplace server
const marketplaceConfig: MCPServerConfig = {
  name: 'ai-agent-marketplace',
  version: '1.0.0',
  description: 'AI Agent Marketplace with automated revenue sharing',
  port: 3001,
  tools: aiAgents,
  paymentConfig: {
    enabled: true,
    defaultAmount: '0.10',
    currency: 'USDC',
    wallet: {
      apiKeyName: process.env.CDP_API_KEY_NAME!,
      privateKey: process.env.CDP_PRIVATE_KEY!,
      networkId: process.env.CDP_NETWORK_ID || 'base-sepolia',
    },
  },
  x402Config: {
    facilitatorUrl: process.env.X402_FACILITATOR_URL!,
    walletAddress: process.env.X402_WALLET_ADDRESS!,
    privateKey: process.env.X402_PRIVATE_KEY!,
  },
};

// Usage example
if (require.main === module) {
  const marketplace = new MonetizedMCPServer(marketplaceConfig);
  
  marketplace.start().then(() => {
    console.log('🤖 AI Agent Marketplace is running!');
    console.log('💡 Available AI Agents:');
    aiAgents.forEach(agent => {
      console.log(`   - ${agent.name}: ${agent.paymentConfig?.amount} ${agent.paymentConfig?.currency}`);
    });
  }).catch(console.error);
}

export { marketplaceConfig, aiAgents, distributeMarketplaceRevenue };