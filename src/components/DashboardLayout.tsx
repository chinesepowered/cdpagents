'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  HomeIcon,
  ChartBarIcon,
  WalletIcon,
  CogIcon,
  DocumentTextIcon,
  BoltIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
  { name: 'Wallet', href: '/wallet', icon: WalletIcon },
  { name: 'Tools', href: '/tools', icon: BoltIcon },
  { name: 'Documentation', href: '/docs', icon: DocumentTextIcon },
  { name: 'Settings', href: '/settings', icon: CogIcon },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Mobile sidebar */}
      <motion.div
        initial={false}
        animate={{ x: sidebarOpen ? 0 : -320 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-xl lg:hidden"
      >
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <BoltIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">MCP Monetization</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-slate-400 hover:text-slate-600"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <nav className="mt-6 px-6">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                'flex items-center px-4 py-3 text-sm font-medium rounded-lg mb-1 transition-colors',
                pathname === item.href
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </Link>
          ))}
        </nav>
      </motion.div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-80 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="bg-white border-r border-slate-200 flex flex-col flex-grow">
          <div className="flex items-center h-16 px-6 border-b border-slate-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <BoltIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">MCP Monetization</span>
            </div>
          </div>
          <nav className="mt-6 flex-1 px-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={clsx(
                  'flex items-center px-4 py-3 text-sm font-medium rounded-lg mb-1 transition-colors',
                  pathname === item.href
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                )}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            ))}
          </nav>
          
          {/* Status indicator */}
          <div className="p-6 border-t border-slate-200">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <div>
                <p className="text-sm font-medium text-slate-900">MCP Server</p>
                <p className="text-xs text-slate-500">Running on port 3001</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-80 flex flex-col flex-1">
        {/* Top bar */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 lg:px-8">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-slate-600 hover:text-slate-900"
            >
              <Bars3Icon className="w-6 h-6" />
            </button>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-slate-600">Connected to CDP Wallet</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span className="text-slate-600">x402 Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main content area */}
        <main className="flex-1 overflow-auto">
          <div className="p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 bg-slate-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}