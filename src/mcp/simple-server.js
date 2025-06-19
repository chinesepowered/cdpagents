#!/usr/bin/env node

// Simple MCP Server for Demo Purposes
// This runs a basic server that demonstrates the MCP monetization concept

// Simple console colors without chalk dependency
const colors = {
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  cyan: (text) => `\x1b[36m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  gray: (text) => `\x1b[90m${text}\x1b[0m`
};

console.log(colors.blue('🚀 Starting MCP Monetization Server...'));

// Mock tool definitions
const tools = [
  {
    name: 'echo',
    description: 'Simple echo service',
    price: 'Free',
    paymentRequired: false
  },
  {
    name: 'premium_analysis', 
    description: 'Advanced data analysis',
    price: '$0.05 USDC',
    paymentRequired: true
  },
  {
    name: 'market_data',
    description: 'Real-time market data', 
    price: '$0.02 USDC',
    paymentRequired: true
  },
  {
    name: 'ai_completion',
    description: 'AI text generation',
    price: '$0.001 USDC', 
    paymentRequired: true
  }
];

// Initialize mock CDP wallet
console.log(colors.yellow('💰 Initializing CDP Wallet (mock mode)...'));
setTimeout(() => {
  console.log(colors.green('✅ CDP Wallet initialized: 0x742d35Cc6634C0532925a3b8D429431E06bb8B4E'));
  console.log(colors.green('🌐 Network: base-sepolia (testnet)'));
}, 1000);

// Register tools
setTimeout(() => {
  console.log(colors.cyan('\n📋 Registering MCP Tools:'));
  tools.forEach(tool => {
    const paymentInfo = tool.paymentRequired ? ` (💰 ${tool.price})` : ' (🆓 free)';
    console.log(colors.green(`✅ ${tool.name}: ${tool.description}${paymentInfo}`));
  });
}, 1500);

// Server status
setTimeout(() => {
  console.log(colors.green(`\n✅ MCP Server running with ${tools.length} tools`));
  console.log(colors.green('   Payment enabled: ✅'));
  console.log(colors.green('   Port: 3002 (avoiding conflict with Next.js)'));
  console.log(colors.cyan('\n📊 Server Metrics:'));
  console.log(colors.cyan('   Total requests today: 2,866'));
  console.log(colors.cyan('   Revenue today: $29.37 USDC'));
  console.log(colors.cyan('   Success rate: 98.2%'));
}, 2000);

// Simulate ongoing activity
let requestCount = 2866;
let revenue = 29.37;

setInterval(() => {
  // Simulate random requests
  if (Math.random() > 0.7) {
    requestCount++;
    const tool = tools[Math.floor(Math.random() * tools.length)];
    
    if (tool.paymentRequired) {
      const amount = parseFloat(tool.price.replace('$', '').replace(' USDC', ''));
      revenue += amount;
      console.log(colors.cyan(`📞 Request: ${tool.name} (+$${amount.toFixed(3)}) | Total: $${revenue.toFixed(2)}`));
    } else {
      console.log(colors.gray(`📞 Request: ${tool.name} (free)`));
    }
  }
}, 3000);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log(colors.yellow('\n🛑 Shutting down MCP server...'));
  console.log(colors.green('✅ Server stopped gracefully'));
  process.exit(0);
});

// Keep server running
process.on('uncaughtException', (error) => {
  console.error(colors.red('❌ Uncaught Exception:'), error);
});

console.log(colors.blue('\n🎯 MCP Monetization Server Demo Ready!'));
console.log(colors.gray('   Press Ctrl+C to stop'));