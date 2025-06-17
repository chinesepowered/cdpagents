import axios from 'axios';
import { createHash, randomBytes } from 'crypto';
import { X402PaymentInstruction, X402PaymentProof, PaymentRequest, PaymentResponse } from '@/types';
import config from './config';
import { cdpWallet } from './cdp-wallet';

export class X402PaymentManager {
  private facilitatorUrl: string;
  private walletAddress: string;
  private privateKey: string;

  constructor() {
    this.facilitatorUrl = config.x402.facilitatorUrl;
    this.walletAddress = config.x402.walletAddress;
    this.privateKey = config.x402.privateKey;
  }

  // Generate payment instruction for HTTP 402 response
  generatePaymentInstruction(
    amount: string,
    currency: string = 'USDC',
    description: string = 'MCP Service Payment',
    metadata?: Record<string, any>
  ): X402PaymentInstruction {
    const instruction: X402PaymentInstruction = {
      method: 'x402-payment',
      amount,
      currency,
      recipient: this.walletAddress,
      facilitator: this.facilitatorUrl,
      metadata: {
        description,
        timestamp: Date.now(),
        ...metadata,
      },
    };

    return instruction;
  }

  // Create a payment request (server-side)
  async createPaymentRequest(
    amount: string,
    currency: string = 'USDC',
    description: string = 'MCP Service Payment',
    expirationMinutes: number = 30
  ): Promise<PaymentRequest> {
    const id = this.generatePaymentId();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + expirationMinutes * 60 * 1000);

    const paymentRequest: PaymentRequest = {
      id,
      amount,
      currency,
      description,
      recipient: this.walletAddress,
      createdAt: now,
      expiresAt,
      status: 'pending',
      metadata: {
        facilitator: this.facilitatorUrl,
      },
    };

    // Store payment request (in production, use persistent storage)
    this.storePaymentRequest(paymentRequest);

    return paymentRequest;
  }

  // Verify payment proof (server-side validation)
  async verifyPayment(
    paymentId: string,
    paymentProof: X402PaymentProof
  ): Promise<{ valid: boolean; error?: string }> {
    try {
      // 1. Retrieve original payment request
      const paymentRequest = this.getPaymentRequest(paymentId);
      if (!paymentRequest) {
        return { valid: false, error: 'Payment request not found' };
      }

      // 2. Check if payment is still valid (not expired)
      if (new Date() > paymentRequest.expiresAt) {
        return { valid: false, error: 'Payment request expired' };
      }

      // 3. Verify payment proof with facilitator
      const verificationResponse = await axios.post(`${this.facilitatorUrl}/verify`, {
        transactionId: paymentProof.transactionId,
        amount: paymentProof.amount,
        currency: paymentProof.currency,
        recipient: this.walletAddress,
        signature: paymentProof.signature,
      });

      if (!verificationResponse.data.valid) {
        return { valid: false, error: 'Invalid payment proof' };
      }

      // 4. Settle payment (trigger actual transfer)
      const settlementResponse = await axios.post(`${this.facilitatorUrl}/settle`, {
        transactionId: paymentProof.transactionId,
        paymentId,
      });

      if (settlementResponse.data.success) {
        // Update payment request status
        paymentRequest.status = 'paid';
        this.storePaymentRequest(paymentRequest);

        // Trigger revenue distribution if configured
        await this.distributeRevenue(paymentRequest);

        return { valid: true };
      } else {
        return { valid: false, error: 'Settlement failed' };
      }
    } catch (error) {
      console.error('❌ Payment verification failed:', error);
      return { 
        valid: false, 
        error: error instanceof Error ? error.message : 'Verification failed' 
      };
    }
  }

  // Generate HTTP 402 response
  generate402Response(paymentInstruction: X402PaymentInstruction): Response {
    const bodyContent = JSON.stringify({
      error: 'Payment Required',
      code: 402,
      payment: paymentInstruction,
    });

    return new Response(bodyContent, {
      status: 402,
      headers: {
        'Content-Type': 'application/json',
        'WWW-Authenticate': `x402-payment amount="${paymentInstruction.amount}" currency="${paymentInstruction.currency}" recipient="${paymentInstruction.recipient}" facilitator="${paymentInstruction.facilitator}"`,
        'X-Payment-Required': JSON.stringify(paymentInstruction),
      },
    });
  }

  // Client-side: Submit payment
  async submitPayment(
    paymentInstruction: X402PaymentInstruction,
    fromAddress: string
  ): Promise<PaymentResponse> {
    try {
      // 1. Create payment transaction via CDP Wallet
      const paymentResult = await cdpWallet.sendPayment(
        paymentInstruction.recipient,
        paymentInstruction.amount,
        paymentInstruction.currency
      );

      if (!paymentResult.success) {
        return paymentResult;
      }

      // 2. Generate payment proof
      const paymentProof: X402PaymentProof = {
        signature: this.generatePaymentSignature(paymentResult.transactionId!, paymentInstruction),
        transactionId: paymentResult.transactionId!,
        amount: paymentInstruction.amount,
        currency: paymentInstruction.currency,
        timestamp: Date.now(),
      };

      // 3. Submit proof to facilitator
      const proofResponse = await axios.post(`${paymentInstruction.facilitator}/proof`, {
        proof: paymentProof,
        instruction: paymentInstruction,
      });

      if (proofResponse.data.accepted) {
        return {
          success: true,
          transactionId: paymentResult.transactionId,
          receipt: paymentResult.receipt,
        };
      } else {
        return {
          success: false,
          error: 'Payment proof rejected',
        };
      }
    } catch (error) {
      console.error('❌ Payment submission failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment failed',
      };
    }
  }

  // Middleware for express/next.js routes
  createPaymentMiddleware(amount: string, currency: string = 'USDC') {
    return async (req: any, res: any, next: any) => {
      const paymentProof = req.headers['x-payment-proof'];
      
      if (!paymentProof) {
        // No payment provided, return 402
        const instruction = this.generatePaymentInstruction(amount, currency);
        return res.status(402).json({
          error: 'Payment Required',
          payment: instruction,
        });
      }

      try {
        const proof: X402PaymentProof = JSON.parse(paymentProof);
        const verification = await this.verifyPayment(req.path, proof);
        
        if (verification.valid) {
          // Payment verified, continue to actual endpoint
          req.paymentVerified = true;
          req.paymentProof = proof;
          next();
        } else {
          res.status(402).json({
            error: 'Invalid payment',
            message: verification.error,
          });
        }
      } catch (error) {
        res.status(400).json({
          error: 'Invalid payment proof format',
        });
      }
    };
  }

  private generatePaymentId(): string {
    return `pay_${randomBytes(16).toString('hex')}`;
  }

  private generatePaymentSignature(transactionId: string, instruction: X402PaymentInstruction): string {
    const data = `${transactionId}:${instruction.amount}:${instruction.currency}:${instruction.recipient}`;
    return createHash('sha256').update(data + this.privateKey).digest('hex');
  }

  // In-memory storage (replace with persistent storage in production)
  private paymentRequests = new Map<string, PaymentRequest>();

  private storePaymentRequest(request: PaymentRequest): void {
    this.paymentRequests.set(request.id, request);
  }

  private getPaymentRequest(id: string): PaymentRequest | undefined {
    return this.paymentRequests.get(id);
  }

  // Revenue distribution
  private async distributeRevenue(paymentRequest: PaymentRequest): Promise<void> {
    try {
      // Example distribution: 70% to developer, 20% to platform, 10% network fees
      const totalAmount = parseFloat(paymentRequest.amount);
      const distributionConfig = {
        developer: { 
          address: process.env.DEVELOPER_WALLET_ADDRESS || this.walletAddress, 
          percentage: 70 
        },
        platform: { 
          address: process.env.PLATFORM_WALLET_ADDRESS || this.walletAddress, 
          percentage: 20 
        },
      };

      await cdpWallet.autoDistributeRevenue(
        paymentRequest.amount,
        paymentRequest.currency,
        distributionConfig
      );

      console.log(`✅ Revenue distributed for payment ${paymentRequest.id}`);
    } catch (error) {
      console.error('❌ Revenue distribution failed:', error);
    }
  }
}

// Singleton instance
export const x402Payment = new X402PaymentManager();