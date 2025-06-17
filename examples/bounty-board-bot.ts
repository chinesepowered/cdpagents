/**
 * Bounty Board Bot Example
 * 
 * Demonstrates a bounty board bot that:
 * - Collects entry fees for coding bounties
 * - Routes prize payouts automatically to winners
 * - Takes a platform percentage for hosting
 */

import { MonetizedMCPServer } from '../src/mcp/server';
import { MCPTool, MCPServerConfig } from '../src/types';
import { cdpWallet } from '../src/lib/cdp-wallet';
import { x402Payment } from '../src/lib/x402-payment';

interface Bounty {
  id: string;
  title: string;
  description: string;
  prizePool: string;
  currency: string;
  entryFee: string;
  deadline: Date;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  participants: string[];
  winner?: string;
  submissions: Array<{
    participantAddress: string;
    submissionUrl: string;
    submittedAt: Date;
  }>;
  createdBy: string;
  createdAt: Date;
}

// In-memory bounty storage (use database in production)
const bounties = new Map<string, Bounty>();
const userBalances = new Map<string, number>();

const bountyBotTools: MCPTool[] = [
  {
    name: 'create_bounty',
    description: 'Create a new coding bounty with prize pool',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Bounty title' },
        description: { type: 'string', description: 'Detailed bounty description' },
        prizePool: { type: 'string', description: 'Total prize pool amount' },
        entryFee: { type: 'string', description: 'Entry fee per participant' },
        currency: { type: 'string', default: 'USDC', description: 'Currency for prizes and fees' },
        deadlineHours: { type: 'number', description: 'Hours until deadline' },
        creatorAddress: { type: 'string', description: 'Bounty creator wallet address' },
      },
      required: ['title', 'description', 'prizePool', 'entryFee', 'creatorAddress'],
    },
    handler: async (params) => {
      const bountyId = `bounty_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const deadline = new Date();
      deadline.setHours(deadline.getHours() + (params.deadlineHours || 72));
      
      const bounty: Bounty = {
        id: bountyId,
        title: params.title,
        description: params.description,
        prizePool: params.prizePool,
        currency: params.currency || 'USDC',
        entryFee: params.entryFee,
        deadline,
        status: 'open',
        participants: [],
        submissions: [],
        createdBy: params.creatorAddress,
        createdAt: new Date(),
      };
      
      bounties.set(bountyId, bounty);
      
      return {
        bountyId,
        message: 'Bounty created successfully',
        bounty: {
          ...bounty,
          participantCount: 0,
          timeRemaining: deadline.getTime() - Date.now(),
        },
      };
    },
    paymentRequired: true,
    paymentConfig: {
      amount: '0.05', // $0.05 to create a bounty
      currency: 'USDC',
    },
  },
  
  {
    name: 'join_bounty',
    description: 'Join a bounty by paying entry fee',
    inputSchema: {
      type: 'object',
      properties: {
        bountyId: { type: 'string', description: 'Bounty ID to join' },
        participantAddress: { type: 'string', description: 'Participant wallet address' },
      },
      required: ['bountyId', 'participantAddress'],
    },
    handler: async (params) => {
      const bounty = bounties.get(params.bountyId);
      if (!bounty) {
        throw new Error('Bounty not found');
      }
      
      if (bounty.status !== 'open') {
        throw new Error('Bounty is not open for new participants');
      }
      
      if (new Date() > bounty.deadline) {
        throw new Error('Bounty deadline has passed');
      }
      
      if (bounty.participants.includes(params.participantAddress)) {
        throw new Error('Already participating in this bounty');
      }
      
      // Add participant
      bounty.participants.push(params.participantAddress);
      
      // Add entry fee to user balance (they paid via x402)
      const currentBalance = userBalances.get(params.participantAddress) || 0;
      userBalances.set(params.participantAddress, currentBalance + parseFloat(bounty.entryFee));
      
      bounties.set(params.bountyId, bounty);
      
      return {
        message: 'Successfully joined bounty',
        bountyId: params.bountyId,
        participantCount: bounty.participants.length,
        timeRemaining: bounty.deadline.getTime() - Date.now(),
        entryFeePaid: bounty.entryFee,
      };
    },
    paymentRequired: true,
    paymentConfig: {
      amount: '0.10', // Variable based on bounty entry fee
      currency: 'USDC',
    },
  },
  
  {
    name: 'submit_solution',
    description: 'Submit a solution to a bounty',
    inputSchema: {
      type: 'object',
      properties: {
        bountyId: { type: 'string', description: 'Bounty ID' },
        participantAddress: { type: 'string', description: 'Participant wallet address' },
        submissionUrl: { type: 'string', description: 'URL to submission (GitHub, etc.)' },
      },
      required: ['bountyId', 'participantAddress', 'submissionUrl'],
    },
    handler: async (params) => {
      const bounty = bounties.get(params.bountyId);
      if (!bounty) {
        throw new Error('Bounty not found');
      }
      
      if (!bounty.participants.includes(params.participantAddress)) {
        throw new Error('Must join bounty before submitting');
      }
      
      if (new Date() > bounty.deadline) {
        throw new Error('Submission deadline has passed');
      }
      
      // Check if already submitted
      const existingSubmission = bounty.submissions.find(
        s => s.participantAddress === params.participantAddress
      );
      
      if (existingSubmission) {
        // Update existing submission
        existingSubmission.submissionUrl = params.submissionUrl;
        existingSubmission.submittedAt = new Date();
      } else {
        // Add new submission
        bounty.submissions.push({
          participantAddress: params.participantAddress,
          submissionUrl: params.submissionUrl,
          submittedAt: new Date(),
        });
      }
      
      bounties.set(params.bountyId, bounty);
      
      return {
        message: 'Solution submitted successfully',
        bountyId: params.bountyId,
        submissionUrl: params.submissionUrl,
        submissionsCount: bounty.submissions.length,
      };
    },
    paymentRequired: false, // Free to submit once joined
  },
  
  {
    name: 'complete_bounty',
    description: 'Complete bounty and distribute prizes',
    inputSchema: {
      type: 'object',
      properties: {
        bountyId: { type: 'string', description: 'Bounty ID to complete' },
        winnerAddress: { type: 'string', description: 'Winner wallet address' },
        judgeAddress: { type: 'string', description: 'Judge wallet address' },
      },
      required: ['bountyId', 'winnerAddress', 'judgeAddress'],
    },
    handler: async (params) => {
      const bounty = bounties.get(params.bountyId);
      if (!bounty) {
        throw new Error('Bounty not found');
      }
      
      if (bounty.status !== 'open' && bounty.status !== 'in_progress') {
        throw new Error('Bounty already completed or cancelled');
      }
      
      if (!bounty.participants.includes(params.winnerAddress)) {
        throw new Error('Winner must be a bounty participant');
      }
      
      // Calculate prize distribution
      const totalCollected = bounty.participants.length * parseFloat(bounty.entryFee);
      const platformFee = totalCollected * 0.10; // 10% platform fee
      const judgeReward = totalCollected * 0.05; // 5% judge reward
      const winnerPrize = totalCollected - platformFee - judgeReward;
      
      // Distribute prizes
      const distributions = await Promise.all([
        // Winner gets the main prize
        cdpWallet.sendPayment(params.winnerAddress, winnerPrize.toFixed(6), bounty.currency),
        // Judge gets reward
        cdpWallet.sendPayment(params.judgeAddress, judgeReward.toFixed(6), bounty.currency),
        // Platform gets fee
        cdpWallet.sendPayment(
          process.env.PLATFORM_WALLET_ADDRESS || bounty.createdBy, 
          platformFee.toFixed(6), 
          bounty.currency
        ),
      ]);
      
      // Update bounty status
      bounty.status = 'completed';
      bounty.winner = params.winnerAddress;
      bounties.set(params.bountyId, bounty);
      
      return {
        message: 'Bounty completed and prizes distributed',
        bountyId: params.bountyId,
        winner: params.winnerAddress,
        distributions: {
          winnerPrize: `${winnerPrize.toFixed(6)} ${bounty.currency}`,
          judgeReward: `${judgeReward.toFixed(6)} ${bounty.currency}`,
          platformFee: `${platformFee.toFixed(6)} ${bounty.currency}`,
        },
        transactionIds: distributions.map(d => d.transactionId),
      };
    },
    paymentRequired: true,
    paymentConfig: {
      amount: '0.02', // $0.02 for judging fee
      currency: 'USDC',
    },
  },
  
  {
    name: 'list_bounties',
    description: 'List all available bounties',
    inputSchema: {
      type: 'object',
      properties: {
        status: { 
          type: 'string', 
          enum: ['open', 'in_progress', 'completed', 'cancelled'],
          description: 'Filter by bounty status'
        },
        limit: { type: 'number', description: 'Maximum number of bounties to return' },
      },
    },
    handler: async (params) => {
      let bountyList = Array.from(bounties.values());
      
      if (params.status) {
        bountyList = bountyList.filter(b => b.status === params.status);
      }
      
      if (params.limit) {
        bountyList = bountyList.slice(0, params.limit);
      }
      
      return {
        bounties: bountyList.map(bounty => ({
          ...bounty,
          participantCount: bounty.participants.length,
          submissionCount: bounty.submissions.length,
          timeRemaining: bounty.deadline.getTime() - Date.now(),
          totalCollected: bounty.participants.length * parseFloat(bounty.entryFee),
        })),
        totalCount: bountyList.length,
      };
    },
    paymentRequired: false, // Free to list bounties
  },
  
  {
    name: 'get_bounty_details',
    description: 'Get detailed information about a specific bounty',
    inputSchema: {
      type: 'object',
      properties: {
        bountyId: { type: 'string', description: 'Bounty ID' },
      },
      required: ['bountyId'],
    },
    handler: async (params) => {
      const bounty = bounties.get(params.bountyId);
      if (!bounty) {
        throw new Error('Bounty not found');
      }
      
      return {
        ...bounty,
        participantCount: bounty.participants.length,
        submissionCount: bounty.submissions.length,
        timeRemaining: bounty.deadline.getTime() - Date.now(),
        totalCollected: bounty.participants.length * parseFloat(bounty.entryFee),
        isExpired: new Date() > bounty.deadline,
      };
    },
    paymentRequired: false, // Free to view details
  },
];

// Bounty Bot server configuration
const bountyBotConfig: MCPServerConfig = {
  name: 'bounty-board-bot',
  version: '1.0.0',
  description: 'Automated bounty board with prize distribution',
  port: 3002,
  tools: bountyBotTools,
  paymentConfig: {
    enabled: true,
    defaultAmount: '0.05',
    currency: 'USDC',
    wallet: {
      apiKeyName: process.env.CDP_API_KEY_NAME!,
      privateKey: process.env.CDP_PRIVATE_KEY!,
      networkId: process.env.CDP_NETWORK_ID || 'base-sepolia',
    },
  },
  x402Config: {
    facilitatorUrl: process.env.X402_FACILITATOR_URL!,
    walletAddress: process.env.X402_WALLET_ADDRESS!,
    privateKey: process.env.X402_PRIVATE_KEY!,
  },
};

// Auto-complete expired bounties (background job)
setInterval(async () => {
  const now = new Date();
  for (const [id, bounty] of Array.from(bounties.entries())) {
    if (bounty.status === 'open' && now > bounty.deadline) {
      if (bounty.submissions.length === 0) {
        // No submissions - refund participants
        bounty.status = 'cancelled';
        console.log(`🔄 Bounty ${id} cancelled - no submissions`);
      } else {
        // Mark as in_progress for manual judging
        bounty.status = 'in_progress';
        console.log(`⏰ Bounty ${id} deadline reached - needs judging`);
      }
      bounties.set(id, bounty);
    }
  }
}, 60000); // Check every minute

// Usage example
if (require.main === module) {
  const bountyBot = new MonetizedMCPServer(bountyBotConfig);
  
  bountyBot.start().then(() => {
    console.log('🏆 Bounty Board Bot is running!');
    console.log('💡 Available Commands:');
    bountyBotTools.forEach(tool => {
      const price = tool.paymentRequired ? ` (${tool.paymentConfig?.amount} ${tool.paymentConfig?.currency})` : ' (free)';
      console.log(`   - ${tool.name}${price}`);
    });
  }).catch(console.error);
}

export { bountyBotConfig, bountyBotTools, bounties };