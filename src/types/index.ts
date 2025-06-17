// Core payment and wallet types
export interface PaymentConfig {
  amount: string;
  currency: string;
  recipient?: string;
  metadata?: Record<string, any>;
}

export interface PaymentRequest {
  id: string;
  amount: string;
  currency: string;
  description: string;
  recipient: string;
  createdAt: Date;
  expiresAt: Date;
  status: 'pending' | 'paid' | 'expired' | 'failed';
  metadata?: Record<string, any>;
}

export interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  error?: string;
  receipt?: PaymentReceipt;
}

export interface PaymentReceipt {
  id: string;
  transactionHash: string;
  amount: string;
  currency: string;
  fromAddress: string;
  toAddress: string;
  timestamp: Date;
  networkFee: string;
}

// CDP Wallet types
export interface WalletConfig {
  apiKeyName: string;
  privateKey: string;
  networkId: string;
}

export interface WalletInfo {
  id: string;
  address: string;
  networkId: string;
  balance: Record<string, string>;
}

export interface TransactionInfo {
  hash: string;
  status: 'pending' | 'confirmed' | 'failed';
  amount: string;
  currency: string;
  fromAddress: string;
  toAddress: string;
  timestamp: Date;
  networkFee: string;
}

// x402 Protocol types
export interface X402PaymentInstruction {
  method: string;
  amount: string;
  currency: string;
  recipient: string;
  facilitator: string;
  metadata?: Record<string, any>;
}

export interface X402PaymentProof {
  signature: string;
  transactionId: string;
  amount: string;
  currency: string;
  timestamp: number;
}

// MCP Server types
export interface MCPTool {
  name: string;
  description: string;
  inputSchema: any;
  handler: (params: any) => Promise<any>;
  paymentRequired?: boolean;
  paymentConfig?: PaymentConfig;
}

export interface MCPServerConfig {
  name: string;
  version: string;
  description: string;
  port: number;
  tools: MCPTool[];
  paymentConfig: {
    enabled: boolean;
    defaultAmount: string;
    currency: string;
    wallet: WalletConfig;
  };
  x402Config?: {
    facilitatorUrl: string;
    walletAddress: string;
    privateKey: string;
  };
}

export interface MCPRequest {
  id: string;
  method: string;
  params: any;
  userId?: string;
  paymentProof?: X402PaymentProof;
}

export interface MCPResponse {
  id: string;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
  paymentRequired?: {
    amount: string;
    currency: string;
    instructions: X402PaymentInstruction;
  };
}

// Dashboard and Analytics types
export interface UsageMetrics {
  totalRequests: number;
  paidRequests: number;
  totalRevenue: string;
  averageRequestValue: string;
  topTools: Array<{
    name: string;
    count: number;
    revenue: string;
  }>;
  timeseriesData: Array<{
    timestamp: Date;
    requests: number;
    revenue: string;
  }>;
}

export interface RevenueDistribution {
  totalRevenue: string;
  developerShare: string;
  platformFee: string;
  networkFees: string;
  currency: string;
}

// Amazon Bedrock types (optional)
export interface BedrockConfig {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  modelId: string;
}

export interface BedrockRequest {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  modelId?: string;
}

export interface BedrockResponse {
  completion: string;
  inputTokens: number;
  outputTokens: number;
  cost: string;
}

// Configuration and Environment types
export interface AppConfig {
  app: {
    name: string;
    url: string;
    port: number;
  };
  mcp: {
    port: number;
  };
  cdp: WalletConfig;
  x402: {
    facilitatorUrl: string;
    walletAddress: string;
    privateKey: string;
  };
  payments: {
    defaultAmount: string;
    currency: string;
    timeoutMs: number;
  };
  bedrock?: BedrockConfig;
  database?: {
    url: string;
  };
  security: {
    jwtSecret: string;
    encryptionKey: string;
  };
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}