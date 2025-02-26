import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useAccount, useWalletClient } from 'wagmi';
import { ABI } from '../config/abi';
import { 
  Shield, 
  ExternalLink, 
  Copy, 
  AlertCircle,
  Key,
  UserX,
  UserPlus,
  Coins,
  RefreshCw,
  Settings
} from 'lucide-react';

const CONTRACT_ADDRESS = 'YOUR_CONTRACT_ADDRESS_HERE';

// Common role constants
const ROLES = {
  ADMIN_ROLE: 'ADMIN_ROLE',
  VALIDATOR_ROLE: 'VALIDATOR_ROLE',
  OPERATOR_ROLE: 'OPERATOR_ROLE',
  PAUSER_ROLE: 'PAUSER_ROLE'
};

const AdminInteraction: React.FC = () => {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [role, setRole] = useState<string>(ROLES.VALIDATOR_ROLE);
  const [roleAddress, setRoleAddress] = useState<string>('');
  const [rewardAmount, setRewardAmount] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<{ message: string; isError: boolean } | null>(null);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [contractStats, setContractStats] = useState({
    totalStaked: '0',
    rewardBalance: '0',
    activeValidators: '0'
  });

  useEffect(() => {
    const setupContract = async () => {
      if (walletClient && address) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const tempContract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
          setContract(tempContract);
          
          // Check if user has admin role
          const hasAdminRole = await tempContract.hasRole(ethers.id(ROLES.ADMIN_ROLE), address);
          if (!hasAdminRole) {
            setStatus({ 
              message: 'You do not have admin privileges for this contract', 
              isError: true 
            });
          } else {
            // Fetch contract stats
            await refreshContractStats(tempContract);
          }
        } catch (error) {
          console.error("Contract setup failed:", error);
          setStatus({ 
            message: 'Failed to initialize contract', 
            isError: true 
          });
        }
      }
    };
    
    setupContract();
  }, [walletClient, address]);

  const refreshContractStats = async (contractInstance: ethers.Contract) => {
    try {
      // These function calls depend on your actual contract methods
      const totalStaked = await contractInstance.totalSupply();
      const rewardBalance = await contractInstance.getRewardBalance();
      
      // Get validator count (example - adjust based on your contract)
      const validatorRoleHash = ethers.id(ROLES.VALIDATOR_ROLE);
      const validatorCount = await contractInstance.getRoleMemberCount(validatorRoleHash);
      
      setContractStats({
        totalStaked: ethers.formatEther(totalStaked),
        rewardBalance: ethers.formatEther(rewardBalance),
        activeValidators: validatorCount.toString()
      });
    } catch (error) {
      console.error("Failed to refresh contract stats:", error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(text);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const handleTransaction = async (action: () => Promise<any>, successMessage: string) => {
    if (!contract) {
      setStatus({ message: 'Contract not initialized', isError: true });
      return;
    }
    
    setLoading(true);
    setStatus({ message: 'Processing transaction...', isError: false });
    
    try {
      const tx = await action();
      await tx.wait();
      setStatus({ message: successMessage, isError: false });
      
      // Refresh contract stats after successful transaction
      await refreshContractStats(contract);
    } catch (error: any) {
      console.error(error);
      setStatus({ message: error.reason || error.message || 'Transaction failed', isError: true });
    }
    
    setLoading(false);
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
              onClick={() => contract && refreshContractStats(contract)}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
            >
              Retry
            </button>
          )}
        </div>
      )}
      
      {/* Admin Dashboard */}
      <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 rounded-lg p-8 backdrop-blur-sm border border-indigo-500/20">
        <div className="flex items-center space-x-4 mb-6">
          <Settings className="h-12 w-12 text-indigo-400" />
          <div>
            <h2 className="text-2xl font-bold">Admin Dashboard</h2>
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
          <button
            onClick={() => contract && refreshContractStats(contract)}
            className="ml-auto p-2 hover:bg-gray-700/50 rounded-full transition-colors"
            title="Refresh Stats"
          >
            <RefreshCw className="h-5 w-5 text-gray-400" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Total Staked</span>
              <Shield className="h-5 w-5 text-purple-400" />
            </div>
            <div className="text-xl font-semibold">{contractStats.totalStaked} RON</div>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Reward Balance</span>
              <Coins className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="text-xl font-semibold">{contractStats.rewardBalance} RON</div>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Active Validators</span>
              <Key className="h-5 w-5 text-blue-400" />
            </div>
            <div className="text-xl font-semibold">{contractStats.activeValidators}</div>
          </div>
        </div>
        
        {/* Role Management */}
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Role Management</h3>
            <Key className="h-5 w-5 text-indigo-400" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-3 text-white outline-none focus:border-indigo-500 transition-colors"
                disabled={loading}
              >
                {Object.entries(ROLES).map(([key, value]) => (
                  <option key={key} value={value}>{value}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-2">Address</label>
              <input
                type="text"
                value={roleAddress}
                onChange={(e) => setRoleAddress(e.target.value)}
                placeholder="0x..."
                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-3 text-white outline-none focus:border-indigo-500 transition-colors"
                disabled={loading}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg flex items-center justify-center space-x-2 transition-colors disabled:bg-gray-700 disabled:cursor-not-allowed"
              onClick={() => handleTransaction(
                () => contract!.grantRole(ethers.id(role), roleAddress),
                `${role} granted successfully to ${roleAddress.slice(0, 6)}...${roleAddress.slice(-4)}`
              )}
              disabled={loading || !role || !roleAddress || !address}
            >
              <UserPlus className="h-5 w-5" />
              <span>Grant Role</span>
            </button>
            
            <button
              className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-lg flex items-center justify-center space-x-2 transition-colors disabled:bg-gray-700 disabled:cursor-not-allowed"
              onClick={() => handleTransaction(
                () => contract!.revokeRole(ethers.id(role), roleAddress),
                `${role} revoked successfully from ${roleAddress.slice(0, 6)}...${roleAddress.slice(-4)}`
              )}
              disabled={loading || !role || !roleAddress || !address}
            >
              <UserX className="h-5 w-5" />
              <span>Revoke Role</span>
            </button>
          </div>
        </div>
        
        {/* Reward Management */}
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Reward Management</h3>
            <Coins className="h-5 w-5 text-yellow-400" />
          </div>
          
          <div className="flex space-x-4 mb-4">
            <div className="flex-1">
              <label className="block text-sm text-gray-400 mb-2">Reward Amount</label>
              <input
                type="number"
                value={rewardAmount}
                onChange={(e) => setRewardAmount(e.target.value)}
                placeholder="Amount in RON"
                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-3 text-white outline-none focus:border-yellow-500 transition-colors"
                disabled={loading}
              />
            </div>
            
            <div className="flex items-end">
              <button
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors disabled:bg-gray-700 disabled:cursor-not-allowed"
                onClick={() => handleTransaction(
                  () => contract!.depositReward(ethers.parseUnits(rewardAmount, 18)),
                  `${rewardAmount} RON reward deposited successfully`
                )}
                disabled={loading || !rewardAmount || Number(rewardAmount) <= 0 || !address}
              >
                <Coins className="h-5 w-5" />
                <span>Deposit Reward</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminInteraction;