import { NextRequest, NextResponse } from 'next/server';
import { walletManager } from '@/lib/wallet-manager';
import { ApiResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { mode } = await request.json();
    
    if (!mode || (mode !== 'mock' && mode !== 'real')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid mode. Must be "mock" or "real"',
          timestamp: new Date(),
        },
        { status: 400 }
      );
    }

    // Switch wallet mode
    await walletManager.setMode(mode);
    
    // Get updated wallet info
    const walletInfo = await walletManager.getWalletInfo();
    
    const response: ApiResponse<{
      mode: string;
      walletInfo: typeof walletInfo;
      message: string;
    }> = {
      success: true,
      data: {
        mode,
        walletInfo,
        message: `Successfully switched to ${mode} mode`,
      },
      timestamp: new Date(),
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to switch wallet mode:', error);
    
    const errorResponse: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to switch wallet mode',
      timestamp: new Date(),
    };
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

export async function GET() {
  try {
    const walletInfo = await walletManager.getWalletInfo();
    const isRealAvailable = walletManager.isRealWalletAvailable();
    
    const response: ApiResponse<{
      currentMode: string;
      realWalletAvailable: boolean;
      walletInfo: typeof walletInfo;
    }> = {
      success: true,
      data: {
        currentMode: walletManager.getMode(),
        realWalletAvailable: isRealAvailable,
        walletInfo,
      },
      timestamp: new Date(),
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to get wallet mode:', error);
    
    const errorResponse: ApiResponse = {
      success: false,
      error: 'Failed to get wallet mode',
      timestamp: new Date(),
    };
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
}