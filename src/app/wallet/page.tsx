'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import WalletModeToggle from '@/components/WalletModeToggle';
import { motion } from 'framer-motion';
import { WalletIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';

export default function WalletPage() {
  const [walletInfo, setWalletInfo] = useState<any>(null);
  const [transactions, setTransactions] = useState([
    {
      id: '1',
      type: 'received',
      amount: '5.50',
      currency: 'USDC',
      from: '0x1234...5678',
      timestamp: '2 hours ago',
      hash: '0xabcd...efgh'
    },
    {
      id: '2', 
      type: 'sent',
      amount: '1.20',
      currency: 'USDC',
      to: '0x8765...4321',
      timestamp: '5 hours ago',
      hash: '0x1234...5678'
    },
    {
      id: '3',
      type: 'received',
      amount: '12.80',
      currency: 'USDC',
      from: '0x9999...1111',
      timestamp: '1 day ago',
      hash: '0x9876...5432'
    }
  ]);

  useEffect(() => {
    // Mock wallet info
    setWalletInfo({
      address: '0x742d35Cc6634C0532925a3b8D429431E06bb8B4E',
      networkId: 'base-sepolia',
      balance: { USDC: '127.43', ETH: '0.25' },
      mode: 'mock'
    });
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold gradient-text">Wallet Management</h1>
            <p className="text-slate-600 mt-2">Manage your CDP Wallet and view transactions</p>
          </div>
          <WalletIcon className="w-8 h-8 text-blue-600" />
        </motion.div>

        {/* Wallet Mode Toggle */}
        <WalletModeToggle onModeChange={(mode) => {
          console.log(`Switched to ${mode} mode`);
          // Update wallet info based on mode
          if (walletInfo) {
            setWalletInfo({ ...walletInfo, mode });
          }
        }} />

        {/* Wallet Info */}
        {walletInfo && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Wallet Details</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-slate-600">Address:</span>
                  <div className="font-mono text-sm bg-slate-100 p-2 rounded mt-1">
                    {walletInfo.address}
                  </div>
                </div>
                <div>
                  <span className="text-sm text-slate-600">Network:</span>
                  <div className="font-medium">{walletInfo.networkId}</div>
                </div>
                <div>
                  <span className="text-sm text-slate-600">Mode:</span>
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                    walletInfo.mode === 'real' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {walletInfo.mode === 'real' ? 'Live Testnet' : 'Demo Mode'}
                  </span>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Balances</h3>
              <div className="space-y-3">
                {Object.entries(walletInfo.balance).map(([currency, amount]) => (
                  <div key={currency} className="flex justify-between items-center">
                    <span className="font-medium">{currency}</span>
                    <span className="text-lg font-bold">{amount as string}</span>
                  </div>
                ))}
              </div>
              
              {walletInfo.mode === 'real' && (
                <button className="w-full mt-4 btn-secondary">
                  🚰 Request Testnet Funds
                </button>
              )}
            </div>
          </div>
        )}

        {/* Transaction History */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
          <div className="space-y-3">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${
                    tx.type === 'received' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {tx.type === 'received' ? (
                      <ArrowDownIcon className="w-4 h-4 text-green-600" />
                    ) : (
                      <ArrowUpIcon className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium">
                      {tx.type === 'received' ? 'Received' : 'Sent'} {tx.amount} {tx.currency}
                    </div>
                    <div className="text-sm text-slate-600">
                      {tx.type === 'received' ? `From ${tx.from}` : `To ${tx.to}`}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-slate-600">{tx.timestamp}</div>
                  <div className="text-xs text-slate-500 font-mono">{tx.hash}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}