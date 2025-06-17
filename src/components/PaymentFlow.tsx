'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  PlayIcon,
  PauseIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  WalletIcon,
  BoltIcon,
} from '@heroicons/react/24/outline';

type FlowStep = {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'active' | 'completed' | 'error';
  icon: React.ReactNode;
};

const steps: FlowStep[] = [
  {
    id: 'request',
    title: 'Client Request',
    description: 'User requests premium tool',
    status: 'completed',
    icon: <BoltIcon className="w-5 h-5" />,
  },
  {
    id: 'payment-required',
    title: 'Payment Required',
    description: 'Server returns 402 with x402 instructions',
    status: 'completed',
    icon: <ExclamationTriangleIcon className="w-5 h-5" />,
  },
  {
    id: 'payment',
    title: 'Payment Submitted',
    description: 'Client sends USDC via CDP Wallet',
    status: 'active',
    icon: <CurrencyDollarIcon className="w-5 h-5" />,
  },
  {
    id: 'verification',
    title: 'Payment Verification',
    description: 'x402 facilitator verifies payment',
    status: 'pending',
    icon: <CheckCircleIcon className="w-5 h-5" />,
  },
  {
    id: 'settlement',
    title: 'Revenue Distribution',
    description: 'Funds distributed to stakeholders',
    status: 'pending',
    icon: <WalletIcon className="w-5 h-5" />,
  },
];

export default function PaymentFlow() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(2);

  const handlePlay = () => {
    setIsPlaying(!isPlaying);
    
    if (!isPlaying) {
      // Simulate payment flow animation
      const interval = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            clearInterval(interval);
            return 0;
          }
          return prev + 1;
        });
      }, 2000);
    }
  };

  const getStepStatus = (index: number): FlowStep['status'] => {
    if (index < currentStep) return 'completed';
    if (index === currentStep) return 'active';
    return 'pending';
  };

  const getStepColor = (status: FlowStep['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-600 border-green-200';
      case 'active':
        return 'bg-blue-100 text-blue-600 border-blue-200 animate-pulse';
      case 'error':
        return 'bg-red-100 text-red-600 border-red-200';
      default:
        return 'bg-slate-100 text-slate-400 border-slate-200';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="card"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Payment Flow Demo</h3>
          <p className="text-sm text-slate-600">
            See how x402 + CDP Wallet enables seamless micropayments
          </p>
        </div>
        
        <button
          onClick={handlePlay}
          className="btn-primary flex items-center space-x-2"
        >
          {isPlaying ? (
            <PauseIcon className="w-4 h-4" />
          ) : (
            <PlayIcon className="w-4 h-4" />
          )}
          <span>{isPlaying ? 'Pause' : 'Start Demo'}</span>
        </button>
      </div>

      {/* Flow Steps */}
      <div className="relative">
        {/* Connection Lines */}
        <div className="absolute top-8 left-8 right-8 h-0.5 bg-slate-200 -z-10">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-green-500"
            initial={{ width: '0%' }}
            animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        <div className="flex justify-between items-start">
          {steps.map((step, index) => {
            const status = getStepStatus(index);
            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex flex-col items-center max-w-32"
              >
                {/* Step Icon */}
                <div
                  className={`w-16 h-16 rounded-full border-2 flex items-center justify-center mb-3 transition-all duration-300 ${getStepColor(
                    status
                  )}`}
                >
                  {status === 'completed' ? (
                    <CheckCircleIcon className="w-6 h-6 text-green-600" />
                  ) : (
                    step.icon
                  )}
                </div>

                {/* Step Content */}
                <div className="text-center">
                  <div className="font-medium text-slate-900 text-sm mb-1">
                    {step.title}
                  </div>
                  <div className="text-xs text-slate-600 leading-tight">
                    {step.description}
                  </div>
                </div>

                {/* Step Status */}
                <div className="mt-2">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : status === 'active'
                        ? 'bg-blue-100 text-blue-800'
                        : status === 'error'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {status === 'completed'
                      ? 'Done'
                      : status === 'active'
                      ? 'Active'
                      : status === 'error'
                      ? 'Error'
                      : 'Pending'}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Current Step Details */}
      <div className="mt-8 p-4 bg-slate-50 rounded-lg">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
            {steps[currentStep]?.icon}
          </div>
          <div>
            <div className="font-medium text-slate-900">
              {steps[currentStep]?.title}
            </div>
            <div className="text-sm text-slate-600">
              {steps[currentStep]?.description}
            </div>
          </div>
        </div>

        {/* Step-specific details */}
        {currentStep === 2 && (
          <div className="mt-3 p-3 bg-white rounded border border-slate-200">
            <div className="text-xs font-medium text-slate-700 mb-2">
              Payment Details:
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>Amount: $0.05 USDC</div>
              <div>Tool: premium_analysis</div>
              <div>From: 0x1234...5678</div>
              <div>To: 0x8765...4321</div>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="mt-3 p-3 bg-white rounded border border-slate-200">
            <div className="text-xs font-medium text-slate-700 mb-2">
              Revenue Split:
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span>Developer (70%)</span>
                <span>$0.035 USDC</span>
              </div>
              <div className="flex justify-between">
                <span>Platform (20%)</span>
                <span>$0.010 USDC</span>
              </div>
              <div className="flex justify-between">
                <span>Network Fee (10%)</span>
                <span>$0.005 USDC</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}