import { Coinbase, Wallet, WalletData, Transfer, Asset } from '@coinbase/coinbase-sdk';
import { WalletConfig, WalletInfo, TransactionInfo, PaymentResponse } from '@/types';
import config from './config';

export class CDPWalletManager {
  private coinbase: Coinbase;
  private wallet: Wallet | null = null;
  private initialized = false;

  constructor(private walletConfig: WalletConfig = config.cdp) {
    // Initialize Coinbase SDK
    Coinbase.configure({
      apiKeyName: this.walletConfig.apiKeyName,
      privateKey: this.walletConfig.privateKey,
    });
    this.coinbase = Coinbase;
  }

  async initialize(): Promise<void> {
    try {
      // Try to load existing wallet or create new one
      if (process.env.CDP_WALLET_DATA) {
        // Load from saved wallet data
        const walletData: WalletData = JSON.parse(process.env.CDP_WALLET_DATA);
        this.wallet = await Wallet.import(walletData);
      } else {
        // Create new wallet
        this.wallet = await Wallet.create({ networkId: this.walletConfig.networkId });
        
        // Save wallet data for future use (in production, store securely)
        console.log('💡 Save this wallet data to CDP_WALLET_DATA environment variable:');
        console.log(JSON.stringify(this.wallet.export()));
      }

      await this.wallet.faucet(); // Fund wallet on testnet
      this.initialized = true;
      
      console.log(`✅ CDP Wallet initialized: ${this.wallet.getDefaultAddress()?.getId()}`);
    } catch (error) {
      console.error('❌ Failed to initialize CDP wallet:', error);
      throw error;
    }
  }

  async getWalletInfo(): Promise<WalletInfo> {
    this.ensureInitialized();
    
    const address = this.wallet!.getDefaultAddress();
    const balances = await address!.listBalances();
    
    const balanceMap: Record<string, string> = {};
    balances.forEach((balance) => {
      balanceMap[balance.asset.assetId] = balance.amount.toString();
    });

    return {
      id: this.wallet!.getId(),
      address: address!.getId(),
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
      const asset = await Asset.fetch(this.walletConfig.networkId, currency);
      const transfer = await this.wallet!.createTransfer({
        amount: parseFloat(amount),
        assetId: asset.assetId,
        destination: recipientAddress,
      });

      await transfer.wait();

      const transaction = transfer.getTransaction();
      
      return {
        success: true,
        transactionId: transaction.getTransactionHash(),
        receipt: {
          id: transfer.getId(),
          transactionHash: transaction.getTransactionHash(),
          amount,
          currency,
          fromAddress: this.wallet!.getDefaultAddress()!.getId(),
          toAddress: recipientAddress,
          timestamp: new Date(),
          networkFee: transaction.getTransactionHash() // Placeholder - get actual fee
        }
      };
    } catch (error) {
      console.error('❌ Payment failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async getTransactionHistory(limit: number = 10): Promise<TransactionInfo[]> {
    this.ensureInitialized();

    try {
      const address = this.wallet!.getDefaultAddress();
      const transfers = await this.wallet!.listTransfers();

      return transfers.slice(0, limit).map((transfer) => ({
        hash: transfer.getTransactionHash() || '',
        status: this.mapTransferStatus(transfer.getStatus()),
        amount: transfer.getAmount().toString(),
        currency: transfer.getAsset().assetId,
        fromAddress: transfer.getFromAddress() || '',
        toAddress: transfer.getToAddress() || '',
        timestamp: new Date(), // Placeholder - get actual timestamp
        networkFee: '0', // Placeholder - get actual fee
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

    for (const recipient of recipients) {
      const amount = (total * recipient.percentage / 100).toFixed(6);
      const result = await this.sendPayment(recipient.address, amount, currency);
      results.push(result);
    }

    return results;
  }

  async estimateNetworkFee(
    recipientAddress: string,
    amount: string,
    currency: string = 'USDC'
  ): Promise<string> {
    // Placeholder implementation - in real implementation, estimate gas costs
    return '0.001'; // Base network typically has very low fees
  }

  private ensureInitialized(): void {
    if (!this.initialized || !this.wallet) {
      throw new Error('CDP Wallet not initialized. Call initialize() first.');
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

  // Treasury management methods
  async getTreasuryBalance(): Promise<Record<string, string>> {
    const walletInfo = await this.getWalletInfo();
    return walletInfo.balance;
  }

  async autoDistributeRevenue(
    totalRevenue: string,
    currency: string,
    distributionConfig: {
      developer: { address: string; percentage: number };
      platform: { address: string; percentage: number };
      contributors?: Array<{ address: string; percentage: number }>;
    }
  ): Promise<PaymentResponse[]> {
    const recipients = [
      distributionConfig.developer,
      distributionConfig.platform,
      ...(distributionConfig.contributors || [])
    ];

    return this.splitPayment(totalRevenue, currency, recipients);
  }
}

// Singleton instance
export const cdpWallet = new CDPWalletManager();