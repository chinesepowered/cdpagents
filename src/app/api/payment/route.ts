import { NextRequest, NextResponse } from 'next/server';
import { x402Payment } from '@/lib/x402-payment';
import { PaymentRequest, X402PaymentProof, ApiResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { action, ...params } = await request.json();
    
    let result;
    
    switch (action) {
      case 'create_payment_request':
        result = await x402Payment.createPaymentRequest(
          params.amount,
          params.currency || 'USDC',
          params.description || 'MCP Service Payment',
          params.expirationMinutes || 30
        );
        break;
        
      case 'verify_payment':
        const paymentProof: X402PaymentProof = params.paymentProof;
        result = await x402Payment.verifyPayment(params.paymentId, paymentProof);
        break;
        
      case 'generate_payment_instruction':
        result = x402Payment.generatePaymentInstruction(
          params.amount,
          params.currency || 'USDC',
          params.description || 'MCP Service Payment',
          params.metadata
        );
        break;
        
      case 'submit_payment':
        result = await x402Payment.submitPayment(
          params.paymentInstruction,
          params.fromAddress
        );
        break;
        
      default:
        throw new Error(`Unknown payment action: ${action}`);
    }
    
    const response: ApiResponse = {
      success: true,
      data: result,
      timestamp: new Date(),
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Payment action failed:', error);
    
    const errorResponse: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Payment action failed',
      timestamp: new Date(),
    };
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

// Handle HTTP 402 Payment Required responses
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const amount = searchParams.get('amount') || '0.01';
  const currency = searchParams.get('currency') || 'USDC';
  const description = searchParams.get('description') || 'MCP Service Payment';
  
  try {
    const paymentInstruction = x402Payment.generatePaymentInstruction(
      amount,
      currency,
      description
    );
    
    // Return 402 Payment Required with x402 instructions
    return new Response(
      JSON.stringify({
        error: 'Payment Required',
        code: 402,
        message: 'This resource requires payment to access',
        payment: paymentInstruction,
      }),
      {
        status: 402,
        headers: {
          'Content-Type': 'application/json',
          'WWW-Authenticate': `x402-payment amount="${amount}" currency="${currency}" recipient="${paymentInstruction.recipient}" facilitator="${paymentInstruction.facilitator}"`,
          'X-Payment-Required': JSON.stringify(paymentInstruction),
        },
      }
    );
  } catch (error) {
    console.error('Failed to generate payment instruction:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to generate payment instruction',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}