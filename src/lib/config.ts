import { AppConfig } from '@/types';

function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key];
  if (!value && !defaultValue) {
    throw new Error(`Environment variable ${key} is required`);
  }
  return value || defaultValue!;
}

function getOptionalEnvVar(key: string, defaultValue?: string): string | undefined {
  return process.env[key] || defaultValue;
}

export const config: AppConfig = {
  app: {
    name: getEnvVar('NEXT_PUBLIC_APP_NAME', 'MCP Monetization Template'),
    url: getEnvVar('NEXT_PUBLIC_APP_URL', 'http://localhost:3000'),
    port: parseInt(getEnvVar('PORT', '3000'), 10),
  },
  mcp: {
    port: parseInt(getEnvVar('MCP_SERVER_PORT', '3001'), 10),
  },
  cdp: {
    apiKeyName: getEnvVar('CDP_API_KEY_NAME'),
    privateKey: getEnvVar('CDP_PRIVATE_KEY'),
    networkId: getEnvVar('CDP_NETWORK_ID', 'base-sepolia'),
  },
  x402: {
    facilitatorUrl: getEnvVar('X402_FACILITATOR_URL', 'https://facilitator.x402.org'),
    walletAddress: getEnvVar('X402_WALLET_ADDRESS'),
    privateKey: getEnvVar('X402_PRIVATE_KEY'),
  },
  payments: {
    defaultAmount: getEnvVar('DEFAULT_PAYMENT_AMOUNT', '0.01'),
    currency: getEnvVar('DEFAULT_CURRENCY', 'USDC'),
    timeoutMs: parseInt(getEnvVar('PAYMENT_TIMEOUT_MS', '30000'), 10),
  },
  bedrock: getOptionalEnvVar('AWS_REGION') ? {
    region: getEnvVar('AWS_REGION'),
    accessKeyId: getEnvVar('AWS_ACCESS_KEY_ID'),
    secretAccessKey: getEnvVar('AWS_SECRET_ACCESS_KEY'),
    modelId: getEnvVar('BEDROCK_MODEL_ID', 'anthropic.claude-3-sonnet-20240229-v1:0'),
  } : undefined,
  database: getOptionalEnvVar('DATABASE_URL') ? {
    url: getEnvVar('DATABASE_URL'),
  } : undefined,
  security: {
    jwtSecret: getEnvVar('JWT_SECRET'),
    encryptionKey: getEnvVar('ENCRYPTION_KEY'),
  },
};

export default config;