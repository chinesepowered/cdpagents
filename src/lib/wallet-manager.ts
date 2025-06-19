import { CDPWalletManager } from './cdp-wallet';
import { WalletInfo, TransactionInfo, PaymentResponse } from '@/types';

type WalletMode = 'mock' | 'real';

class UnifiedWalletManager {
  private mode: WalletMode = 'mock';
  private mockWallet: CDPWalletManager;
  private realWallet: any | null = null;

  constructor() {
    this.mockWallet = new CDPWalletManager();
    
    // Check if we can initialize real wallet
    if (this.canUseRealWallet()) {
      try {
        const { RealCDPWalletManager } = require('./cdp-wallet-real');
        this.realWallet = new RealCDPWalletManager();
      } catch (error) {
        console.warn('⚠️  Real CDP wallet not available:', error instanceof Error ? error.message : String(error));
        this.realWallet = null;
      }
    }
  }

  private canUseRealWallet(): boolean {
    const hasCredentials = Boolean(process.env.CDP_API_KEY_NAME && 
                          process.env.CDP_PRIVATE_KEY &&
                          !process.env.CDP_API_KEY_NAME.startsWith('placeholder') &&
                          !process.env.CDP_PRIVATE_KEY.startsWith('placeholder'));
    
    return hasCredentials;
  }

  async setMode(mode: WalletMode): Promise<void> {
    if (mode === 'real' && !this.realWallet) {
      throw new Error('Real wallet not available. Please configure CDP credentials.');
    }
    
    this.mode = mode;
    console.log(`🔄 Switched to ${mode} wallet mode`);
    
    // Initialize the selected wallet
    await this.getCurrentWallet().initialize();
  }

  getMode(): WalletMode {
    return this.mode;
  }

  isRealWalletAvailable(): boolean {
    return this.realWallet !== null;
  }

  private getCurrentWallet(): CDPWalletManager | any {
    if (this.mode === 'real' && this.realWallet) {
      return this.realWallet;
    }
    return this.mockWallet;
  }

  async initialize(): Promise<void> {
    try {
      return await this.getCurrentWallet().initialize();
    } catch (error) {
      console.warn('Wallet initialization failed:', error);
      // Continue with mock mode if initialization fails
    }
  }

  async getWalletInfo(): Promise<WalletInfo & { mode: WalletMode }> {
    const info = await this.getCurrentWallet().getWalletInfo();
    return { ...info, mode: this.mode };
  }

  async sendPayment(
    recipientAddress: string,
    amount: string,
    currency: string = 'USDC'
  ): Promise<PaymentResponse> {
    return this.getCurrentWallet().sendPayment(recipientAddress, amount, currency);
  }

  async getTransactionHistory(limit: number = 10): Promise<TransactionInfo[]> {
    return this.getCurrentWallet().getTransactionHistory(limit);
  }

  async splitPayment(
    totalAmount: string,
    currency: string,
    recipients: Array<{ address: string; percentage: number }>
  ): Promise<PaymentResponse[]> {
    return this.getCurrentWallet().splitPayment(totalAmount, currency, recipients);
  }

  async estimateNetworkFee(
    recipientAddress: string,
    amount: string,
    currency: string = 'USDC'
  ): Promise<string> {
    return this.getCurrentWallet().estimateNetworkFee(recipientAddress, amount, currency);
  }

  // Real wallet specific methods
  async requestFaucetFunds(): Promise<void> {
    if (this.mode === 'real' && this.realWallet && this.realWallet.requestFaucetFunds) {
      await this.realWallet.requestFaucetFunds();
    } else {
      console.log('🚰 Faucet only available in real mode');
    }
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
export const walletManager = new UnifiedWalletManager();