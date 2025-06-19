'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { motion } from 'framer-motion';
import { DocumentTextIcon, CodeBracketIcon, RocketLaunchIcon } from '@heroicons/react/24/outline';

export default function DocsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold gradient-text">Documentation</h1>
            <p className="text-slate-600 mt-2">Learn how to use and extend the MCP Monetization Template</p>
          </div>
          <DocumentTextIcon className="w-8 h-8 text-blue-600" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card card-hover"
          >
            <RocketLaunchIcon className="w-8 h-8 text-green-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Quick Start</h3>
            <p className="text-sm text-slate-600 mb-4">
              Get up and running with the MCP Monetization Template in minutes.
            </p>
            <ul className="text-sm space-y-2">
              <li>• Install dependencies</li>
              <li>• Configure environment</li>
              <li>• Start the demo</li>
              <li>• Enable live mode</li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card card-hover"
          >
            <CodeBracketIcon className="w-8 h-8 text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">API Reference</h3>
            <p className="text-sm text-slate-600 mb-4">
              Complete API documentation for integrating payment flows.
            </p>
            <ul className="text-sm space-y-2">
              <li>• Wallet management</li>
              <li>• Payment verification</li>
              <li>• Tool registration</li>
              <li>• Revenue distribution</li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card card-hover"
          >
            <DocumentTextIcon className="w-8 h-8 text-purple-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Examples</h3>
            <p className="text-sm text-slate-600 mb-4">
              Real-world examples and use cases for different scenarios.
            </p>
            <ul className="text-sm space-y-2">
              <li>• AI Agent Marketplace</li>
              <li>• Bounty Board Bot</li>
              <li>• Micro-SaaS APIs</li>
              <li>• Custom integrations</li>
            </ul>
          </motion.div>
        </div>

        {/* Quick Start Guide */}
        <div className="card">
          <h3 className="text-xl font-semibold mb-4">🚀 Quick Start Guide</h3>
          
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">1. Install Dependencies</h4>
              <div className="bg-slate-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                pnpm install
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-2">2. Configure Environment</h4>
              <div className="bg-slate-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                cp .env.example .env<br/>
                # Add your CDP credentials to .env
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-2">3. Start the Demo</h4>
              <div className="bg-slate-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                pnpm run demo
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-2">4. Toggle Live Mode</h4>
              <p className="text-slate-600">
                Visit the dashboard at <code className="bg-slate-100 px-1 rounded">localhost:3000</code> and 
                use the wallet mode toggle to switch between demo and live CDP integration.
              </p>
            </div>
          </div>
        </div>

        {/* Key Features */}
        <div className="card">
          <h3 className="text-xl font-semibold mb-4">🏆 Key Features</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">✅ Complete Payment Loop</h4>
              <p className="text-sm text-slate-600">
                Revenue in → Payment out with automatic distribution to stakeholders
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-2">🔗 Real CDP Integration</h4>
              <p className="text-sm text-slate-600">
                Live testnet integration with Coinbase Developer Platform SDK
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-2">🎭 Smart Demo Mode</h4>
              <p className="text-sm text-slate-600">
                Mock implementations for instant demos without external dependencies
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-2">⚡ Production Ready</h4>
              <p className="text-sm text-slate-600">
                Clean TypeScript code with comprehensive error handling and monitoring
              </p>
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="card">
          <h3 className="text-xl font-semibold mb-4">📚 Additional Resources</h3>
          
          <div className="space-y-3">
            <a href="https://github.com/your-repo" className="block p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
              <div className="font-medium">GitHub Repository</div>
              <div className="text-sm text-slate-600">View source code and contribute</div>
            </a>

            <a href="https://docs.cdp.coinbase.com" className="block p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
              <div className="font-medium">CDP Documentation</div>
              <div className="text-sm text-slate-600">Official Coinbase Developer Platform docs</div>
            </a>

            <a href="https://x402.org" className="block p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
              <div className="font-medium">x402 Protocol</div>
              <div className="text-sm text-slate-600">Learn about the x402 payment standard</div>
            </a>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}