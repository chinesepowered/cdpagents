import { NextRequest, NextResponse } from 'next/server';
import { cdpWallet } from '@/lib/cdp-wallet';
import { WalletInfo, ApiResponse } from '@/types';

export async function GET(request: NextRequest) {
  try {
    // Initialize wallet if not already done
    if (!cdpWallet['initialized']) {
      await cdpWallet.initialize();
    }
    
    const walletInfo = await cdpWallet.getWalletInfo();
    
    const response: ApiResponse<WalletInfo> = {
      success: true,
      data: walletInfo,
      timestamp: new Date(),
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to fetch wallet info:', error);
    
    const errorResponse: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch wallet info',
      timestamp: new Date(),
    };
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, ...params } = await request.json();
    
    // Initialize wallet if not already done
    if (!cdpWallet['initialized']) {
      await cdpWallet.initialize();
    }
    
    let result;
    
    switch (action) {
      case 'send_payment':
        result = await cdpWallet.sendPayment(
          params.recipientAddress,
          params.amount,
          params.currency
        );
        break;
        
      case 'get_transaction_history':
        result = await cdpWallet.getTransactionHistory(params.limit || 10);
        break;
        
      case 'split_payment':
        result = await cdpWallet.splitPayment(
          params.totalAmount,
          params.currency,
          params.recipients
        );
        break;
        
      case 'estimate_fee':
        result = await cdpWallet.estimateNetworkFee(
          params.recipientAddress,
          params.amount,
          params.currency
        );
        break;
        
      default:
        throw new Error(`Unknown action: ${action}`);
    }
    
    const response: ApiResponse = {
      success: true,
      data: result,
      timestamp: new Date(),
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Wallet action failed:', error);
    
    const errorResponse: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Wallet action failed',
      timestamp: new Date(),
    };
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
}