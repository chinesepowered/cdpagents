'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { motion } from 'framer-motion';
import { BoltIcon, CurrencyDollarIcon, PlayIcon } from '@heroicons/react/24/outline';

const tools = [
  {
    name: 'echo',
    description: 'Simple echo service for testing',
    price: 'Free',
    currency: '',
    status: 'active',
    requests: 156,
    revenue: '0.00',
    category: 'utility'
  },
  {
    name: 'premium_analysis', 
    description: 'Advanced data analysis with AI insights',
    price: '0.05',
    currency: 'USDC',
    status: 'active',
    requests: 342,
    revenue: '17.10',
    category: 'ai'
  },
  {
    name: 'market_data',
    description: 'Real-time cryptocurrency market data',
    price: '0.02', 
    currency: 'USDC',
    status: 'active',
    requests: 521,
    revenue: '10.42',
    category: 'data'
  },
  {
    name: 'ai_completion',
    description: 'AI text generation and completion',
    price: '0.001',
    currency: 'USDC', 
    status: 'active',
    requests: 1847,
    revenue: '1.85',
    category: 'ai'
  },
  {
    name: 'bedrock_ai_completion',
    description: 'Premium AI powered by Amazon Bedrock',
    price: '0.01',
    currency: 'USDC',
    status: 'available',
    requests: 0,
    revenue: '0.00',
    category: 'ai'
  }
];

export default function ToolsPage() {
  const testTool = async (toolName: string) => {
    console.log(`Testing tool: ${toolName}`);
    // This would call the actual MCP server
    alert(`Testing ${toolName} - Check console for MCP server response`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold gradient-text">MCP Tools</h1>
            <p className="text-slate-600 mt-2">Manage and monitor your monetized tools</p>
          </div>
          <button className="btn-primary">
            <BoltIcon className="w-5 h-5 mr-2" />
            Add New Tool
          </button>
        </motion.div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool, index) => (
            <motion.div
              key={tool.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card card-hover"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-slate-900">{tool.name}</h3>
                  <p className="text-sm text-slate-600 mt-1">{tool.description}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  tool.status === 'active' 
                    ? 'bg-green-100 text-green-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {tool.status}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Price:</span>
                  <div className="flex items-center">
                    {tool.price === 'Free' ? (
                      <span className="font-medium text-green-600">Free</span>
                    ) : (
                      <>
                        <CurrencyDollarIcon className="w-4 h-4 text-slate-400 mr-1" />
                        <span className="font-medium">{tool.price} {tool.currency}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Requests:</span>
                  <span className="font-medium">{tool.requests.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Revenue:</span>
                  <span className="font-medium text-green-600">
                    ${tool.revenue} {tool.currency}
                  </span>
                </div>

                <div className="pt-3 border-t border-slate-200">
                  <button 
                    onClick={() => testTool(tool.name)}
                    className="w-full btn-secondary flex items-center justify-center"
                  >
                    <PlayIcon className="w-4 h-4 mr-2" />
                    Test Tool
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* MCP Server Status */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">MCP Server Status</h3>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-600 font-medium">Running on port 3001</span>
            </div>
          </div>
          
          <div className="bg-slate-900 text-green-400 p-4 rounded-lg font-mono text-sm">
            <div>🚀 MCP server running with 5 tools</div>
            <div>💰 Payment enabled: ✅</div> 
            <div>🔗 CDP Wallet: Connected (mock mode)</div>
            <div>📊 Total requests today: 2,866</div>
            <div>💵 Revenue today: $29.37 USDC</div>
          </div>

          <div className="mt-4">
            <p className="text-sm text-slate-600">
              MCP Server is running and accepting requests. Tools with payment requirements 
              will automatically handle x402 protocol payments via CDP Wallet.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}