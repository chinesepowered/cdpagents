'use client';

import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { motion } from 'framer-motion';

const data = [
  { date: '2024-01-01', revenue: 12.5, requests: 150 },
  { date: '2024-01-02', revenue: 18.2, requests: 220 },
  { date: '2024-01-03', revenue: 15.8, requests: 180 },
  { date: '2024-01-04', revenue: 22.1, requests: 280 },
  { date: '2024-01-05', revenue: 28.7, requests: 320 },
  { date: '2024-01-06', revenue: 31.4, requests: 350 },
  { date: '2024-01-07', revenue: 35.2, requests: 420 },
  { date: '2024-01-08', revenue: 29.8, requests: 380 },
  { date: '2024-01-09', revenue: 42.3, requests: 480 },
  { date: '2024-01-10', revenue: 38.9, requests: 450 },
  { date: '2024-01-11', revenue: 45.6, requests: 520 },
  { date: '2024-01-12', revenue: 52.1, requests: 580 },
  { date: '2024-01-13', revenue: 48.7, requests: 540 },
  { date: '2024-01-14', revenue: 55.3, requests: 620 },
];

type ChartType = 'revenue' | 'requests';

export default function RevenueChart() {
  const [chartType, setChartType] = useState<ChartType>('revenue');
  const [timeRange, setTimeRange] = useState('7d');

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatRevenue = (value: number) => `$${value.toFixed(2)}`;
  const formatRequests = (value: number) => `${value}`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="card"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Performance Overview</h3>
          <p className="text-sm text-slate-600">Track your revenue and usage trends</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Chart Type Toggle */}
          <div className="flex bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => setChartType('revenue')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                chartType === 'revenue'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Revenue
            </button>
            <button
              onClick={() => setChartType('requests')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                chartType === 'requests'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Requests
            </button>
          </div>

          {/* Time Range Toggle */}
          <div className="flex bg-slate-100 rounded-lg p-1">
            {['7d', '30d', '90d'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  timeRange === range
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'revenue' ? (
            <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                stroke="#64748b"
                fontSize={12}
              />
              <YAxis
                tickFormatter={formatRevenue}
                stroke="#64748b"
                fontSize={12}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
                labelFormatter={(label) => formatDate(label)}
                formatter={(value: number) => [formatRevenue(value), 'Revenue']}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#revenueGradient)"
              />
            </AreaChart>
          ) : (
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                stroke="#64748b"
                fontSize={12}
              />
              <YAxis
                tickFormatter={formatRequests}
                stroke="#64748b"
                fontSize={12}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
                labelFormatter={(label) => formatDate(label)}
                formatter={(value: number) => [formatRequests(value), 'Requests']}
              />
              <Line
                type="monotone"
                dataKey="requests"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: '#10b981', strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-200">
        <div className="text-center">
          <div className="text-2xl font-bold text-slate-900">
            {chartType === 'revenue' ? '$142.83' : '1,247'}
          </div>
          <div className="text-sm text-slate-600">
            Total {chartType === 'revenue' ? 'Revenue' : 'Requests'}
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">+12.5%</div>
          <div className="text-sm text-slate-600">vs Last Period</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {chartType === 'revenue' ? '$0.11' : '89'}
          </div>
          <div className="text-sm text-slate-600">
            Avg per {chartType === 'revenue' ? 'Request' : 'Day'}
          </div>
        </div>
      </div>
    </motion.div>
  );
}