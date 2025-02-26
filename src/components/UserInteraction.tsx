import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useAccount, useWalletClient } from 'wagmi';
import { ABI } from '../config/abi';
import { 
  Shield, 
  ExternalLink, 
  Copy, 
  Wallet, 
  AlertCircle,
  ChevronsUp,
  LogOut,
  Gift,
  RotateCw
} from 'lucide-react';

const CONTRACT_ADDRESS = 'YOUR_CONTRACT_ADDRESS_HERE';

const UserInteraction: React.FC = () => {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [stakeAmount, setStakeAmount] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<{ message: string; isError: boolean } | null>(null);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [userStats, setUserStats] = useState({
    stakedAmount: '0',
    rewards: '0',
    walletBalance: '0'
  });

  useEffect(() => {
    const setupContract = async () => {
      if (walletClient) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const tempContract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
        setContract(tempContract);
        
        // Fetch user stats
        try {
          const stakedAmount = await tempContract.balanceOf(address);
          const rewards = await tempContract.earned(address);
          const walletBalance = await provider.getBalance(address);
          
          setUserStats({
            stakedAmount: ethers.formatEther(stakedAmount),
            rewards: ethers.formatEther(rewards),
            walletBalance: ethers.formatEther(walletBalance)
          });
        } catch (error) {
          console.error("Failed to fetch user stats:", error);
        }
      }
    };
    
    if (address) {
      setupContract();
    }
  }, [walletClient, address]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(text);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const handleTransaction = async (action: () => Promise<any>, successMessage: string) => {
    if (!contract) {
      setStatus({ message: 'Contract not initialized.', isError: true });
      return;
    }
    
    setLoading(true);
    setStatus({ message: 'Processing transaction...', isError: false });
    
    try {
      const tx = await action();
      await tx.wait();
      setStatus({ message: successMessage, isError: false });
      
      // Refresh user stats after successful transaction
      const provider = new ethers.BrowserProvider(window.ethereum);
      const stakedAmount = await contract.balanceOf(address);
      const rewards = await contract.earned(address);
      const walletBalance = await provider.getBalance(address);
      
      setUserStats({
        stakedAmount: ethers.formatEther(stakedAmount),
        rewards: ethers.formatEther(rewards),
        walletBalance: ethers.formatEther(walletBalance)
      });
    } catch (error: any) {
      console.error(error);
      setStatus({ message: error.reason || 'Transaction failed', isError: true });
    }
    
    setLoading(false);
  };

  const refreshData = async () => {
    if (!contract || !address) return;
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const stakedAmount = await contract.balanceOf(address);
      const rewards = await contract.earned(address);
      const walletBalance = await provider.getBalance(address);
      
      setUserStats({
        stakedAmount: ethers.formatEther(stakedAmount),
        rewards: ethers.formatEther(rewards),
        walletBalance: ethers.formatEther(walletBalance)
      });
      
      setStatus({ message: 'Data refreshed successfully', isError: false });
      setTimeout(() => setStatus(null), 3000);
    } catch (error) {
      console.error("Failed to refresh data:", error);
      setStatus({ message: 'Failed to refresh data', isError: true });
    }
  };

  return (
    <div className="space-y-8">
      {status && (
        <div className={`${status.isError ? 'bg-red-500/10 border-red-500/20' : 'bg-green-500/10 border-green-500/20'} border rounded-lg p-4 flex items-center space-x-3`}>
          <AlertCircle className={`h-5 w-5 ${status.isError ? 'text-red-400' : 'text-green-400'} flex-shrink-0`} />
          <div className="flex-1">
            <p className={status.isError ? 'text-red-400' : 'text-green-400'}>{status.message}</p>
          </div>
          {status.isError && (
            <button
              onClick={() => refreshData()}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
            >
              Retry
            </button>
          )}
        </div>
      )}
      
      {/* User Stats */}
      <div className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 rounded-lg p-8 backdrop-blur-sm border border-purple-500/20">
        <div className="flex items-center space-x-4 mb-6">
          <Wallet className="h-12 w-12 text-purple-400" />
          <div>
            <h2 className="text-2xl font-bold">Your Dashboard</h2>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-sm text-gray-400">{address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not connected'}</span>
              {address && (
                <>
                  <button
                    onClick={() => copyToClipboard(address)}
                    className="p-1 hover:bg-gray-700 rounded transition-colors"
                    title="Copy Address"
                  >
                    {copiedAddress === address ? (
                      <span className="text-green-400 text-sm">Copied!</span>
                    ) : (
                      <Copy className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                  <a
                    href={`https://app.roninchain.com/address/${address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 hover:bg-gray-700 rounded transition-colors"
                    title="View on Explorer"
                  >
                    <ExternalLink className="h-4 w-4 text-gray-400" />
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Staked Amount</span>
              <Shield className="h-5 w-5 text-purple-400" />
            </div>
            <div className="text-xl font-semibold">{userStats.stakedAmount} RON</div>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Pending Rewards</span>
              <Gift className="h-5 w-5 text-green-400" />
            </div>
            <div className="text-xl font-semibold">{userStats.rewards} RON</div>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Wallet Balance</span>
              <Wallet className="h-5 w-5 text-blue-400" />
            </div>
            <div className="text-xl font-semibold">{userStats.walletBalance} RON</div>
          </div>
        </div>
        
        {/* Staking Input */}
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700 mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-400">Stake Amount</span>
            <Shield className="h-5 w-5 text-purple-400" />
          </div>
          <div className="flex space-x-4">
            <input
              type="number"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
              placeholder="Amount to stake (RON)"
              className="flex-1 bg-gray-700/50 border border-gray-600 rounded-lg p-3 text-white outline-none focus:border-purple-500 transition-colors"
              disabled={loading}
            />
            <button
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg transition-colors disabled:bg-gray-700 disabled:cursor-not-allowed"
              onClick={() => {
                if (contract && stakeAmount && Number(stakeAmount) > 0) {
                  handleTransaction(
                    () => contract.stake(ethers.parseUnits(stakeAmount, 18)),
                    'Stake successful'
                  );
                }
              }}
              disabled={loading || !stakeAmount || Number(stakeAmount) <= 0 || !address}
            >
              Stake
            </button>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg flex items-center justify-center space-x-2 transition-colors disabled:bg-gray-700 disabled:cursor-not-allowed"
            onClick={() => {
              if (contract) {
                handleTransaction(
                  () => contract.withdraw(),
                  'Withdraw successful'
                );
              }
            }}
            disabled={loading || !address}
          >
            <LogOut className="h-5 w-5" />
            <span>Withdraw All</span>
          </button>
          
          <button
            className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg flex items-center justify-center space-x-2 transition-colors disabled:bg-gray-700 disabled:cursor-not-allowed"
            onClick={() => {
              if (contract) {
                handleTransaction(
                  () => contract.getReward(),
                  'Rewards claimed successfully'
                );
              }
            }}
            disabled={loading || !address}
          >
            <Gift className="h-5 w-5" />
            <span>Claim Rewards</span>
          </button>
          
          <button
            className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-lg flex items-center justify-center space-x-2 transition-colors disabled:bg-gray-700 disabled:cursor-not-allowed"
            onClick={async () => {
              if (contract && address) {
                await handleTransaction(
                  () => contract.getReward(),
                  'Rewards claimed'
                );
                if (stakeAmount && Number(stakeAmount) > 0) {
                  await handleTransaction(
                    () => contract.stake(ethers.parseUnits(stakeAmount, 18)),
                    'Restake successful'
                  );
                }
              }
            }}
            disabled={loading || !address || (!stakeAmount && Number(stakeAmount) <= 0)}
          >
            <RotateCw className="h-5 w-5" />
            <span>Claim & Restake</span>
          </button>
        </div>
      </div>
      
      {/* Additional Action */}
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <ChevronsUp className="h-6 w-6 text-red-400" />
            <h2 className="text-xl font-semibold">Emergency Actions</h2>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <p className="text-gray-400">Withdraw all your funds and exit the staking contract.</p>
          <button
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors disabled:bg-gray-700 disabled:cursor-not-allowed"
            onClick={() => {
              if (contract) {
                handleTransaction(
                  () => contract.exit(),
                  'Exit successful'
                );
              }
            }}
            disabled={loading || !address}
          >
            <LogOut className="h-5 w-5" />
            <span>Exit Staking</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserInteraction;