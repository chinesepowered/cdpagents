'use client';

import { motion } from 'framer-motion';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';
import { clsx } from 'clsx';

interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'increase' | 'decrease';
  icon: React.ReactNode;
  color: 'green' | 'blue' | 'purple' | 'indigo' | 'yellow' | 'red';
  isLoading?: boolean;
}

const colorClasses = {
  green: {
    icon: 'text-green-600 bg-green-100',
    change: 'text-green-600',
  },
  blue: {
    icon: 'text-blue-600 bg-blue-100',
    change: 'text-blue-600',
  },
  purple: {
    icon: 'text-purple-600 bg-purple-100',
    change: 'text-purple-600',
  },
  indigo: {
    icon: 'text-indigo-600 bg-indigo-100',
    change: 'text-indigo-600',
  },
  yellow: {
    icon: 'text-yellow-600 bg-yellow-100',
    change: 'text-yellow-600',
  },
  red: {
    icon: 'text-red-600 bg-red-100',
    change: 'text-red-600',
  },
};

export default function MetricCard({
  title,
  value,
  change,
  changeType = 'increase',
  icon,
  color,
  isLoading = false,
}: MetricCardProps) {
  if (isLoading) {
    return (
      <div className="metric-card">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-slate-200 rounded-lg"></div>
          </div>
          <div className="h-8 bg-slate-200 rounded mb-2"></div>
          <div className="h-4 bg-slate-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="metric-card"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={clsx('p-2 rounded-lg', colorClasses[color].icon)}>
          {icon}
        </div>
        {change && (
          <div className="flex items-center space-x-1">
            {changeType === 'increase' ? (
              <ArrowUpIcon className="w-4 h-4 text-green-500" />
            ) : (
              <ArrowDownIcon className="w-4 h-4 text-red-500" />
            )}
            <span
              className={clsx(
                'text-sm font-medium',
                changeType === 'increase' ? 'text-green-600' : 'text-red-600'
              )}
            >
              {change}
            </span>
          </div>
        )}
      </div>
      
      <div>
        <div className="text-2xl font-bold text-slate-900 mb-1">{value}</div>
        <div className="text-sm text-slate-600">{title}</div>
      </div>
    </motion.div>
  );
}