import { NextRequest, NextResponse } from 'next/server';
import { UsageMetrics, ApiResponse } from '@/types';

// Simulated metrics data (in production, fetch from database)
const generateMetrics = (): UsageMetrics => {
  const baseDate = new Date();
  const timeseriesData = [];
  
  for (let i = 13; i >= 0; i--) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() - i);
    
    timeseriesData.push({
      timestamp: date,
      requests: Math.floor(Math.random() * 100) + 50,
      revenue: (Math.random() * 5 + 2).toFixed(2),
    });
  }

  return {
    totalRequests: 1247,
    paidRequests: 892,
    totalRevenue: '142.83',
    averageRequestValue: '0.11',
    topTools: [
      { name: 'premium_analysis', count: 342, revenue: '17.10' },
      { name: 'market_data', count: 521, revenue: '10.42' },
      { name: 'ai_completion', count: 1847, revenue: '1.85' },
      { name: 'bedrock_ai_completion', count: 156, revenue: '1.56' },
    ],
    timeseriesData,
  };
};

export async function GET(request: NextRequest) {
  try {
    const metrics = generateMetrics();
    
    const response: ApiResponse<UsageMetrics> = {
      success: true,
      data: metrics,
      timestamp: new Date(),
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to fetch metrics:', error);
    
    const errorResponse: ApiResponse = {
      success: false,
      error: 'Failed to fetch metrics',
      timestamp: new Date(),
    };
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { timeRange, tool } = await request.json();
    
    // Filter metrics based on query parameters
    const metrics = generateMetrics();
    
    if (tool) {
      // Filter by specific tool
      metrics.topTools = metrics.topTools.filter(t => t.name === tool);
    }
    
    if (timeRange) {
      // Filter timeseries data by range
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      metrics.timeseriesData = metrics.timeseriesData.slice(-days);
    }
    
    const response: ApiResponse<UsageMetrics> = {
      success: true,
      data: metrics,
      timestamp: new Date(),
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to process metrics request:', error);
    
    const errorResponse: ApiResponse = {
      success: false,
      error: 'Failed to process request',
      timestamp: new Date(),
    };
    
    return NextResponse.json(errorResponse, { status: 400 });
  }
}