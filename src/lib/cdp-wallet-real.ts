import { WalletConfig, WalletInfo, TransactionInfo, PaymentResponse } from '@/types';
import config from './config';

// Conditional import for CDP SDK
let Coinbase: any = null;
let Wallet: any = null;
let WalletData: any = null;

try {
  const cdpSdk = require('@coinbase/coinbase-sdk');
  Coinbase = cdpSdk.Coinbase;
  Wallet = cdpSdk.Wallet;
  WalletData = cdpSdk.WalletData;
} catch (error) {
  console.warn('⚠️  CDP SDK not installed. Real wallet mode unavailable.');
}

export class RealCDPWalletManager {
  private wallet: any | null = null;
  private initialized = false;

  constructor(private walletConfig: WalletConfig = config.cdp) {
    if (!Coinbase || !Wallet) {
      throw new Error('CDP SDK not available. Install @coinbase/coinbase-sdk to use real wallet mode.');
    }

    // Initialize Coinbase SDK for real testnet usage
    try {
      Coinbase.configure({
        apiKeyName: this.walletConfig.apiKeyName,
        privateKey: this.walletConfig.privateKey,
      });
      console.log('🔗 Real CDP SDK configured for testnet');
    } catch (error) {
      console.error('❌ Failed to configure CDP SDK:', error);
      throw error;
    }
  }

  async initialize(): Promise<void> {
    try {
      // Check if we have saved wallet data
      if (process.env.CDP_WALLET_DATA) {
        try {
          const walletData: any = JSON.parse(process.env.CDP_WALLET_DATA);
          this.wallet = await Wallet.import(walletData);
          console.log('📦 Imported existing CDP wallet');
        } catch (error) {
          console.log('⚠️  Failed to import wallet, creating new one');
          this.wallet = await Wallet.create({ networkId: this.walletConfig.networkId });
        }
      } else {
        // Create new wallet
        this.wallet = await Wallet.create({ networkId: this.walletConfig.networkId });
        
        // Save wallet data (in production, store securely!)
        const walletData = this.wallet.export();
        console.log('💡 Save this to CDP_WALLET_DATA environment variable:');
        console.log(JSON.stringify(walletData));
        console.log('🔒 (In production, store this securely!)');
      }

      // Fund wallet on testnet using faucet
      console.log('🚰 Requesting testnet funds...');
      try {
        await this.wallet.faucet();
        console.log('✅ Testnet funds received');
      } catch (error) {
        console.log('⚠️  Faucet request failed (may already have funds):', error);
      }

      this.initialized = true;
      const address = this.wallet.getDefaultAddress();
      console.log(`✅ Real CDP Wallet initialized: ${address?.getId()}`);
      console.log(`🌐 Network: ${this.walletConfig.networkId}`);
      
    } catch (error) {
      console.error('❌ Failed to initialize real CDP wallet:', error);
      throw error;
    }
  }

  async getWalletInfo(): Promise<WalletInfo> {
    this.ensureInitialized();
    
    const address = this.wallet!.getDefaultAddress();
    if (!address) {
      throw new Error('No default address found');
    }

    const balances = await address.listBalances();
    
    const balanceMap: Record<string, string> = {};
    balances.forEach((balance: any) => {
      balanceMap[balance.asset.assetId] = balance.amount.toString();
    });

    return {
      id: this.wallet!.getId(),
      address: address.getId(),
      networkId: this.walletConfig.networkId,
      balance: balanceMap,
    };
  }

  async sendPayment(
    recipientAddress: string,
    amount: string,
    currency: string = 'USDC'
  ): Promise<PaymentResponse> {
    this.ensureInitialized();

    try {
      console.log(`💸 Sending ${amount} ${currency} to ${recipientAddress}`);
      
      const transfer = await this.wallet!.createTransfer({
        amount: parseFloat(amount),
        assetId: currency,
        destination: recipientAddress,
      });

      console.log('⏳ Waiting for transaction confirmation...');
      await transfer.wait();
      
      const transactionHash = transfer.getTransactionHash();
      console.log(`✅ Payment sent! Tx: ${transactionHash}`);
      
      return {
        success: true,
        transactionId: transactionHash,
        receipt: {
          id: transfer.getId(),
          transactionHash: transactionHash,
          amount,
          currency,
          fromAddress: this.wallet!.getDefaultAddress()!.getId(),
          toAddress: recipientAddress,
          timestamp: new Date(),
          networkFee: '0.001' // Estimate - Base has very low fees
        }
      };
    } catch (error) {
      console.error('❌ Real payment failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment failed'
      };
    }
  }

  async getTransactionHistory(limit: number = 10): Promise<TransactionInfo[]> {
    this.ensureInitialized();

    try {
      const transfers = await this.wallet!.listTransfers();

      return transfers.slice(0, limit).map((transfer: any) => ({
        hash: transfer.getTransactionHash() || 'pending',
        status: this.mapTransferStatus(transfer.getStatus()),
        amount: transfer.getAmount().toString(),
        currency: transfer.getAsset().assetId,
        fromAddress: transfer.getFromAddress() || '',
        toAddress: transfer.getToAddress() || '',
        timestamp: new Date(), // Would get real timestamp in production
        networkFee: '0.001',
      }));
    } catch (error) {
      console.error('❌ Failed to get transaction history:', error);
      return [];
    }
  }

  async splitPayment(
    totalAmount: string,
    currency: string,
    recipients: Array<{ address: string; percentage: number }>
  ): Promise<PaymentResponse[]> {
    this.ensureInitialized();

    const results: PaymentResponse[] = [];
    const total = parseFloat(totalAmount);

    console.log(`🔄 Splitting ${totalAmount} ${currency} among ${recipients.length} recipients`);

    for (const recipient of recipients) {
      const amount = (total * recipient.percentage / 100).toFixed(6);
      console.log(`  → ${recipient.percentage}% (${amount} ${currency}) to ${recipient.address}`);
      
      const result = await this.sendPayment(recipient.address, amount, currency);
      results.push(result);
      
      // Small delay between transactions
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return results;
  }

  async estimateNetworkFee(
    recipientAddress: string,
    amount: string,
    currency: string = 'USDC'
  ): Promise<string> {
    // Base network has very low fees
    return '0.001';
  }

  private ensureInitialized(): void {
    if (!this.initialized || !this.wallet) {
      throw new Error('Real CDP Wallet not initialized. Call initialize() first.');
    }
  }

  private mapTransferStatus(status: string): 'pending' | 'confirmed' | 'failed' {
    switch (status.toLowerCase()) {
      case 'complete':
      case 'completed':
        return 'confirmed';
      case 'pending':
        return 'pending';
      case 'failed':
      case 'error':
        return 'failed';
      default:
        return 'pending';
    }
  }

  // Get available testnet faucet
  async requestFaucetFunds(): Promise<void> {
    this.ensureInitialized();
    console.log('🚰 Requesting additional testnet funds...');
    try {
      await this.wallet!.faucet();
      console.log('✅ Additional testnet funds received');
    } catch (error) {
      console.log('⚠️  Faucet request failed:', error);
    }
  }
}

export const realCdpWallet = new RealCDPWalletManager();