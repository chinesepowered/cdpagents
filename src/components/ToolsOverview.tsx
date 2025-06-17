'use client';

import { motion } from 'framer-motion';
import { 
  BoltIcon, 
  ChartBarIcon, 
  CurrencyDollarIcon,
  SparklesIcon,
  GlobeAltIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline';

const tools = [
  {
    name: 'premium_analysis',
    description: 'Advanced data analysis',
    icon: <ChartBarIcon className="w-5 h-5" />,
    price: '$0.05',
    currency: 'USDC',
    requests: 342,
    revenue: '$17.10',
    status: 'active',
    color: 'blue'
  },
  {
    name: 'market_data',
    description: 'Real-time market data',
    icon: <GlobeAltIcon className="w-5 h-5" />,
    price: '$0.02',
    currency: 'USDC',
    requests: 521,
    revenue: '$10.42',
    status: 'active',
    color: 'green'
  },
  {
    name: 'ai_completion',
    description: 'AI text generation',
    icon: <SparklesIcon className="w-5 h-5" />,
    price: '$0.001',
    currency: 'USDC',
    requests: 1847,
    revenue: '$1.85',
    status: 'active',
    color: 'purple'
  },
  {
    name: 'echo',
    description: 'Simple echo service',
    icon: <CpuChipIcon className="w-5 h-5" />,
    price: 'Free',
    currency: '',
    requests: 156,
    revenue: '$0.00',
    status: 'active',
    color: 'gray'
  },
];

const colorClasses = {
  blue: 'bg-blue-100 text-blue-600',
  green: 'bg-green-100 text-green-600',
  purple: 'bg-purple-100 text-purple-600',
  gray: 'bg-gray-100 text-gray-600',
};

export default function ToolsOverview() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="card"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Active Tools</h3>
          <p className="text-sm text-slate-600">Performance by tool</p>
        </div>
        <BoltIcon className="w-6 h-6 text-slate-400" />
      </div>

      <div className="space-y-4">
        {tools.map((tool, index) => (
          <motion.div
            key={tool.name}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${colorClasses[tool.color as keyof typeof colorClasses]}`}>
                {tool.icon}
              </div>
              <div>
                <div className="font-medium text-slate-900">{tool.name}</div>
                <div className="text-sm text-slate-600">{tool.description}</div>
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-sm font-medium text-slate-900">
                  {tool.price}
                </span>
                {tool.currency && (
                  <span className="text-xs text-slate-500">{tool.currency}</span>
                )}
              </div>
              <div className="text-xs text-slate-500">
                {tool.requests} requests
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-6 border-t border-slate-200">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-slate-600">Total Requests</div>
            <div className="text-xl font-bold text-slate-900">2,866</div>
          </div>
          <div>
            <div className="text-sm text-slate-600">Total Revenue</div>
            <div className="text-xl font-bold text-green-600">$29.37</div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <button className="w-full mt-4 btn-secondary">
        <BoltIcon className="w-4 h-4 mr-2" />
        Manage Tools
      </button>
    </motion.div>
  );
}