import { NextResponse } from 'next/server';
import { ApiResponse } from '@/types';

export async function GET() {
  try {
    // Check if real wallet credentials are available
    const hasCredentials = Boolean(process.env.CDP_API_KEY_NAME && 
                          process.env.CDP_PRIVATE_KEY &&
                          !process.env.CDP_API_KEY_NAME.startsWith('placeholder') &&
                          !process.env.CDP_PRIVATE_KEY.startsWith('placeholder'));

    const response: ApiResponse<{
      realWalletAvailable: boolean;
      currentMode: string;
      networkId: string;
    }> = {
      success: true,
      data: {
        realWalletAvailable: hasCredentials,
        currentMode: hasCredentials ? 'real-available' : 'mock-only',
        networkId: process.env.CDP_NETWORK_ID || 'base-sepolia',
      },
      timestamp: new Date(),
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to check wallet status:', error);
    
    const errorResponse: ApiResponse = {
      success: false,
      error: 'Failed to check wallet status',
      timestamp: new Date(),
    };
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
}