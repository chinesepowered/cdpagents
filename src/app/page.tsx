'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CurrencyDollarIcon, 
  ChartBarIcon, 
  WalletIcon, 
  CpuChipIcon,
  ArrowTrendingUpIcon,
  BoltIcon,
  GlobeAltIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import DashboardLayout from '@/components/DashboardLayout';
import MetricCard from '@/components/MetricCard';
import RevenueChart from '@/components/RevenueChart';
import ToolsOverview from '@/components/ToolsOverview';
import PaymentFlow from '@/components/PaymentFlow';
import WalletModeToggle from '@/components/WalletModeToggle';

export default function HomePage() {
  const [metrics, setMetrics] = useState({
    totalRevenue: '142.83',
    totalRequests: 1247,
    activeTools: 4,
    successRate: 98.2,
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading dashboard data
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold gradient-text">
                MCP Monetization Dashboard
              </h1>
              <p className="text-slate-600 mt-2">
                Monitor your monetized MCP server performance and revenue streams
              </p>
            </div>
            <div className="flex space-x-3">
              <button className="btn-secondary">
                <CpuChipIcon className="w-5 h-5 mr-2" />
                MCP Server
              </button>
              <button className="btn-primary">
                <SparklesIcon className="w-5 h-5 mr-2" />
                New Tool
              </button>
            </div>
          </div>
        </motion.div>

        {/* Metrics Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <MetricCard
            title="Total Revenue"
            value={`$${metrics.totalRevenue}`}
            change="+12.5%"
            changeType="increase"
            icon={<CurrencyDollarIcon className="w-6 h-6" />}
            color="green"
            isLoading={isLoading}
          />
          <MetricCard
            title="Total Requests"
            value={metrics.totalRequests.toLocaleString()}
            change="+8.2%"
            changeType="increase"
            icon={<ChartBarIcon className="w-6 h-6" />}
            color="blue"
            isLoading={isLoading}
          />
          <MetricCard
            title="Active Tools"
            value={metrics.activeTools.toString()}
            change="+2"
            changeType="increase"
            icon={<BoltIcon className="w-6 h-6" />}
            color="purple"
            isLoading={isLoading}
          />
          <MetricCard
            title="Success Rate"
            value={`${metrics.successRate}%`}
            change="+0.3%"
            changeType="increase"
            icon={<ArrowTrendingUpIcon className="w-6 h-6" />}
            color="indigo"
            isLoading={isLoading}
          />
        </motion.div>

        {/* Wallet Mode Toggle - Prominent for Judges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <WalletModeToggle onModeChange={(mode) => {
            console.log(`Switched to ${mode} mode`);
            // Could refresh metrics here if needed
          }} />
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Revenue Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <RevenueChart />
          </motion.div>

          {/* Tools Overview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <ToolsOverview />
          </motion.div>
        </div>

        {/* Payment Flow Demo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <PaymentFlow />
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="card card-hover">
            <WalletIcon className="w-8 h-8 text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Wallet Management</h3>
            <p className="text-slate-600 mb-4">
              Monitor your CDP wallet balance and transaction history
            </p>
            <button className="btn-secondary w-full">View Wallet</button>
          </div>

          <div className="card card-hover">
            <CpuChipIcon className="w-8 h-8 text-purple-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Configure Tools</h3>
            <p className="text-slate-600 mb-4">
              Add new tools or modify payment settings for existing ones
            </p>
            <button className="btn-secondary w-full">Manage Tools</button>
          </div>

          <div className="card card-hover">
            <GlobeAltIcon className="w-8 h-8 text-green-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">API Integration</h3>
            <p className="text-slate-600 mb-4">
              Get API keys and integration examples for your applications
            </p>
            <button className="btn-secondary w-full">View Docs</button>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}