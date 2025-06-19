'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { motion } from 'framer-motion';
import { ChartBarIcon, ArrowTrendingUpIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

export default function AnalyticsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold gradient-text">Analytics Dashboard</h1>
            <p className="text-slate-600 mt-2">Deep dive into your monetization metrics</p>
          </div>
          <ChartBarIcon className="w-8 h-8 text-blue-600" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <ArrowTrendingUpIcon className="w-8 h-8 text-green-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Revenue Growth</h3>
            <div className="text-3xl font-bold text-green-600">+247%</div>
            <p className="text-sm text-slate-600">vs last month</p>
          </div>

          <div className="card">
            <CurrencyDollarIcon className="w-8 h-8 text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Average Transaction</h3>
            <div className="text-3xl font-bold text-blue-600">$0.23</div>
            <p className="text-sm text-slate-600">USDC per request</p>
          </div>

          <div className="card">
            <ChartBarIcon className="w-8 h-8 text-purple-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Conversion Rate</h3>
            <div className="text-3xl font-bold text-purple-600">94.2%</div>
            <p className="text-sm text-slate-600">payment success</p>
          </div>
        </div>

        <div className="card">
          <h3 className="text-xl font-semibold mb-4">📊 Advanced Analytics Coming Soon</h3>
          <p className="text-slate-600">
            This page will show detailed revenue analysis, user behavior patterns, 
            and optimization recommendations for your monetized MCP tools.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}