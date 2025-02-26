import { Alchemy, Network } from 'alchemy-sdk';
import { createPublicClient, http, formatEther, getContract } from 'viem';
import { ronin } from 'viem/chains';

const settings = {
  apiKey: import.meta.env.VITE_ALCHEMY_API_KEY,
  network: Network.RONIN_MAINNET,
};

export const alchemy = new Alchemy(settings);

// Create a public client for Ronin
const publicClient = createPublicClient({
  chain: ronin,
  transport: http('https://api.roninchain.com/rpc')
});

// Validator contract ABI (only the functions we need)
const VALIDATOR_ABI = [
  {
    "inputs": [],
    "name": "totalStaked",
    "outputs": [{"type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "commission",
    "outputs": [{"type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "apr",
    "outputs": [{"type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getDelegators",
    "outputs": [
      {
        "components": [
          {"name": "addr", "type": "address"},
          {"name": "stake", "type": "uint256"},
          {"name": "joinedAt", "type": "uint256"}
        ],
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

export const getValidatorData = async (validatorAddress: string) => {
  try {
    const contract = getContract({
      address: validatorAddress as `0x${string}`,
      abi: VALIDATOR_ABI,
      publicClient
    });

    const blockNumber = await publicClient.getBlockNumber();
    
    const [totalStake, commission, apr] = await Promise.all([
      contract.read.totalStaked(),
      contract.read.commission(),
      contract.read.apr()
    ]);

    // Get delegators to count them
    const delegators = await contract.read.getDelegators();
    
    return {
      totalStake: totalStake.toString(),
      commission: (Number(commission) / 100).toFixed(2), // Assuming commission is stored as basis points
      uptime: '99.98', // This might need to be calculated from historical data
      lastSignedBlock: blockNumber.toString(),
      apr: (Number(apr) / 100).toFixed(2), // Assuming APR is stored as basis points
      totalDelegators: delegators.length
    };
  } catch (error) {
    console.error('Error fetching validator data:', error);
    return null;
  }
};

export const getDelegatorsList = async (validatorAddress: string) => {
  try {
    const contract = getContract({
      address: validatorAddress as `0x${string}`,
      abi: VALIDATOR_ABI,
      publicClient
    });

    const [delegators, totalStake] = await Promise.all([
      contract.read.getDelegators(),
      contract.read.totalStaked()
    ]);

    // Get token balances for all delegators
    const balancePromises = delegators.map(async (delegator) => {
      const [nativeBalance, braidsBalance] = await Promise.all([
        publicClient.getBalance({ address: delegator.addr }),
        getTokenBalance(delegator.addr, BRAIDS_TOKEN_ADDRESS)
      ]);

      const stake = delegator.stake.toString();
      const percentage = ((Number(stake) / Number(totalStake)) * 100).toFixed(2);

      return {
        address: delegator.addr,
        stake: stake,
        percentage: percentage,
        joinedAt: new Date(Number(delegator.joinedAt) * 1000).toISOString(),
        nativeBalance: formatEther(nativeBalance),
        braidsBalance: formatEther(BigInt(braidsBalance))
      };
    });

    return await Promise.all(balancePromises);
  } catch (error) {
    console.error('Error fetching delegators:', error);
    return null;
  }
};

export const VALIDATOR_ADDRESS = '0xedcafc4ad8097c2012980a2a7087d74b86bddaf9';
export const BRAIDS_TOKEN_ADDRESS = '0xD144A6466aA76Cc3A892Fda9602372dd884a2C90';

export const getTokenBalance = async (address: string, tokenAddress: string) => {
  try {
    const balance = await alchemy.core.getTokenBalance(
      address as `0x${string}`, 
      tokenAddress as `0x${string}`
    );
    return balance.toString();
  } catch (error) {
    console.error('Error fetching token balance:', error);
    return '0';
  }
};