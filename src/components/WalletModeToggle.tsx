'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CpuChipIcon,
  WalletIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';

type WalletMode = 'mock' | 'real';

interface WalletModeToggleProps {
  onModeChange?: (mode: WalletMode) => void;
}

export default function WalletModeToggle({ onModeChange }: WalletModeToggleProps) {
  const [currentMode, setCurrentMode] = useState<WalletMode>('mock');
  const [isRealAvailable, setIsRealAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [walletInfo, setWalletInfo] = useState<any>(null);

  useEffect(() => {
    checkRealWalletAvailability();
  }, []);

  const checkRealWalletAvailability = async () => {
    try {
      const response = await fetch('/api/wallet/status');
      const data = await response.json();
      setIsRealAvailable(data.realWalletAvailable);
    } catch (error) {
      console.error('Failed to check wallet availability:', error);
      setIsRealAvailable(false);
    }
  };

  const handleModeSwitch = async (mode: WalletMode) => {
    if (mode === 'real' && !isRealAvailable) {
      return;
    }

    setIsLoading(true);
    try {
      // Call API to switch wallet mode
      const response = await fetch('/api/wallet/mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode }),
      });

      if (response.ok) {
        setCurrentMode(mode);
        onModeChange?.(mode);
        
        // Refresh wallet info
        const walletResponse = await fetch('/api/wallet');
        if (walletResponse.ok) {
          const data = await walletResponse.json();
          setWalletInfo(data.data);
        }
      }
    } catch (error) {
      console.error('Failed to switch wallet mode:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 flex items-center">
            <WalletIcon className="w-5 h-5 mr-2" />
            Wallet Integration Mode
          </h3>
          <p className="text-sm text-slate-600">
            Switch between demo mode and real CDP Wallet testnet
          </p>
        </div>
        
        {currentMode === 'real' && (
          <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Live on Base Sepolia</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Mock Mode */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleModeSwitch('mock')}
          disabled={isLoading}
          className={clsx(
            'relative p-4 rounded-lg border-2 transition-all duration-200 text-left',
            currentMode === 'mock'
              ? 'border-blue-500 bg-blue-50'
              : 'border-slate-200 hover:border-slate-300',
            isLoading && 'opacity-50 cursor-not-allowed'
          )}
        >
          <div className="flex items-center justify-between mb-2">
            <CpuChipIcon className="w-6 h-6 text-slate-600" />
            {currentMode === 'mock' && (
              <CheckCircleIcon className="w-5 h-5 text-blue-600" />
            )}
          </div>
          <div className="font-medium text-slate-900 mb-1">Demo Mode</div>
          <div className="text-sm text-slate-600">
            Simulated transactions for demo purposes
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
              Fast
            </span>
            <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-green-100 text-green-800">
              No Setup
            </span>
          </div>
        </motion.button>

        {/* Real Mode */}
        <motion.button
          whileHover={{ scale: isRealAvailable ? 1.02 : 1 }}
          whileTap={{ scale: isRealAvailable ? 0.98 : 1 }}
          onClick={() => handleModeSwitch('real')}
          disabled={isLoading || !isRealAvailable}
          className={clsx(
            'relative p-4 rounded-lg border-2 transition-all duration-200 text-left',
            currentMode === 'real'
              ? 'border-green-500 bg-green-50'
              : isRealAvailable
              ? 'border-slate-200 hover:border-slate-300'
              : 'border-slate-200 bg-slate-50',
            (!isRealAvailable || isLoading) && 'opacity-50 cursor-not-allowed'
          )}
        >
          <div className="flex items-center justify-between mb-2">
            <SparklesIcon className="w-6 h-6 text-slate-600" />
            {currentMode === 'real' && (
              <CheckCircleIcon className="w-5 h-5 text-green-600" />
            )}
            {!isRealAvailable && (
              <ExclamationTriangleIcon className="w-5 h-5 text-amber-600" />
            )}
          </div>
          <div className="font-medium text-slate-900 mb-1">Live Mode</div>
          <div className="text-sm text-slate-600">
            Real CDP Wallet on Base Sepolia testnet
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {isRealAvailable ? (
              <>
                <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-green-100 text-green-800">
                  Testnet
                </span>
                <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-purple-100 text-purple-800">
                  Real CDP
                </span>
              </>
            ) : (
              <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-amber-100 text-amber-800">
                Setup Required
              </span>
            )}
          </div>
        </motion.button>
      </div>

      {/* Wallet Info */}
      {walletInfo && (
        <div className="bg-slate-50 rounded-lg p-4">
          <div className="text-sm font-medium text-slate-900 mb-2">
            Current Wallet Info
          </div>
          <div className="space-y-1 text-xs text-slate-600">
            <div>
              <span className="font-medium">Address:</span>{' '}
              {walletInfo.address?.slice(0, 6)}...{walletInfo.address?.slice(-4)}
            </div>
            <div>
              <span className="font-medium">Network:</span> {walletInfo.networkId}
            </div>
            <div>
              <span className="font-medium">USDC Balance:</span>{' '}
              {walletInfo.balance?.USDC || '0.00'}
            </div>
            {currentMode === 'real' && (
              <div>
                <span className="font-medium">Mode:</span>{' '}
                <span className="text-green-600 font-medium">Live Testnet</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Setup Instructions */}
      {!isRealAvailable && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="text-sm font-medium text-amber-900 mb-1">
            Enable Live Mode
          </div>
          <div className="text-xs text-amber-800">
            Add CDP credentials to .env file:
            <br />
            <code className="text-xs bg-amber-100 px-1 rounded">
              CDP_API_KEY_NAME=&quot;your-key&quot;
            </code>
            <br />
            <code className="text-xs bg-amber-100 px-1 rounded">
              CDP_PRIVATE_KEY=&quot;your-private-key&quot;
            </code>
          </div>
        </div>
      )}

      {/* Real Mode Benefits */}
      {currentMode === 'real' && isRealAvailable && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="text-sm font-medium text-green-900 mb-1">
            🎉 Real CDP Wallet Active!
          </div>
          <div className="text-xs text-green-800">
            • Actual blockchain transactions on Base Sepolia
            <br />
            • Real USDC transfers (testnet tokens)
            <br />
            • Production-ready CDP SDK integration
            <br />• Perfect for hackathon demo to judges!
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-xl">
          <div className="flex items-center space-x-2 text-slate-600">
            <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"></div>
            <span className="text-sm">Switching wallet mode...</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}