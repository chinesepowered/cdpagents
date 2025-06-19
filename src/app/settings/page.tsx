'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { motion } from 'framer-motion';
import { CogIcon, ShieldCheckIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold gradient-text">Settings</h1>
            <p className="text-slate-600 mt-2">Configure your MCP monetization settings</p>
          </div>
          <CogIcon className="w-8 h-8 text-blue-600" />
        </motion.div>

        {/* Payment Settings */}
        <div className="card">
          <div className="flex items-center mb-4">
            <CurrencyDollarIcon className="w-6 h-6 text-green-600 mr-3" />
            <h3 className="text-lg font-semibold">Payment Configuration</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Default Payment Amount
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 py-2 border border-r-0 border-slate-300 bg-slate-50 text-slate-500 text-sm rounded-l-md">
                  $
                </span>
                <input
                  type="number"
                  step="0.001"
                  defaultValue="0.01"
                  className="flex-1 border border-slate-300 rounded-r-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Default Currency
              </label>
              <select className="block w-full border border-slate-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="USDC">USDC</option>
                <option value="ETH">ETH</option>
                <option value="DAI">DAI</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Revenue Split - Developer (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                defaultValue="70"
                className="block w-full border border-slate-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Revenue Split - Platform (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                defaultValue="20"
                className="block w-full border border-slate-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="card">
          <div className="flex items-center mb-4">
            <ShieldCheckIcon className="w-6 h-6 text-blue-600 mr-3" />
            <h3 className="text-lg font-semibold">Security & Access</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <div className="font-medium">Payment Verification</div>
                <div className="text-sm text-slate-600">Require payment proof for paid tools</div>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <div className="font-medium">Auto Revenue Distribution</div>
                <div className="text-sm text-slate-600">Automatically split payments to stakeholders</div>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <div className="font-medium">Request Logging</div>
                <div className="text-sm text-slate-600">Log all tool requests for analytics</div>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
              />
            </div>
          </div>
        </div>

        {/* Environment Status */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Environment Status</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">CDP Wallet Integration</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                Mock Mode
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">x402 Protocol</span>
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                Simulated
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">MCP Server</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                Running
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Amazon Bedrock</span>
              <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                Not Configured
              </span>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button className="btn-primary">
            Save Settings
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}