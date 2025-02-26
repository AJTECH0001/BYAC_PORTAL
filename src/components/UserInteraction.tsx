import React, { useState } from 'react';
import { Shield, Wallet, Gift, RotateCw, ChevronsUp } from 'lucide-react';

const StakingDashboard = () => {
  const [stats, setStats] = useState({
    tokenPrice: 3.70,
    priceChange: 5.59,
    dailyRewards: 50516,
    totalCirculation: 158968514,
    totalStaked: 61862845,
    stakedValue: 228890000,
    estimatedAPR: 29,
    userStaked: 0,
    userRewards: 0,
    walletBalance: 19.7862,
    walletValue: 73.21
  });

  const [stakeAmount, setStakeAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const handleStake = () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) return;
    
    setLoading(true);
    setStatus({ message: 'Processing transaction...', isError: false });
    
    // Simulate transaction
    setTimeout(() => {
      setStats({
        ...stats,
        userStaked: stats.userStaked + parseFloat(stakeAmount),
        walletBalance: stats.walletBalance - parseFloat(stakeAmount)
      });
      setStakeAmount('');
      setStatus({ message: 'Stake successful', isError: false });
      setLoading(false);
      
      // Clear status after 3 seconds
      setTimeout(() => setStatus(null), 3000);
    }, 1500);
  };

  const handleUnstake = () => {
    if (stats.userStaked <= 0) return;
    
    setLoading(true);
    setStatus({ message: 'Processing transaction...', isError: false });
    
    // Simulate transaction
    setTimeout(() => {
      setStats({
        ...stats,
        walletBalance: stats.walletBalance + stats.userStaked,
        userStaked: 0
      });
      setStatus({ message: 'Unstake successful', isError: false });
      setLoading(false);
      
      // Clear status after 3 seconds
      setTimeout(() => setStatus(null), 3000);
    }, 1500);
  };

  return (
    <div className="bg-gray-900 text-white p-6 font-sans">
      {/* Stats Panel */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">RON Stats</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-center">
            <div className="mr-4">
              <div className="bg-blue-600 p-3 rounded-lg">
                <Wallet className="h-6 w-6 text-white" />
              </div>
            </div>
            <div>
              <div className="text-gray-400 text-sm">RON PRICE</div>
              <div className="flex items-center">
                <span className="text-xl font-bold">${stats.tokenPrice}</span>
                <span className="ml-2 text-green-400 text-sm">↑ {stats.priceChange}%</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="mr-4">
              <div className="bg-orange-500 p-3 rounded-lg">
                <Gift className="h-6 w-6 text-white" />
              </div>
            </div>
            <div>
              <div className="text-gray-400 text-sm">DAILY REWARDS</div>
              <div className="text-xl font-bold">{formatNumber(stats.dailyRewards)} RON</div>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="mr-4">
              <div className="bg-orange-600 p-3 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
            </div>
            <div>
              <div className="text-gray-400 text-sm">CIRCULATING SUPPLY</div>
              <div className="text-xl font-bold">{formatNumber(stats.totalCirculation)} RON</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Staking Panel */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">My RON Staking</h2>
            <button className="text-gray-400 text-sm border border-gray-700 rounded px-3 py-1">
              Hide numbers
            </button>
          </div>
          
          <div className="bg-gray-900 rounded-lg p-4 mb-8">
            <div className="flex items-center mb-4">
              <div className="bg-orange-500 p-2 rounded-lg mr-3">
                <Gift className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-gray-400 text-sm">CLAIMABLE REWARDS</div>
                <div className="text-lg font-bold">{stats.userRewards} RON</div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <div className="text-gray-400 text-sm mb-1">TOTAL STAKED</div>
              <div className="text-xl font-bold">{stats.userStaked} RON</div>
              <div className="text-gray-500 text-sm">≈ ${(stats.userStaked * stats.tokenPrice).toFixed(2)}</div>
            </div>
            
            <div>
              <div className="text-gray-400 text-sm mb-1">AVAILABLE IN WALLET</div>
              <div className="text-xl font-bold">{stats.walletBalance} RON</div>
              <div className="text-gray-500 text-sm">≈ ${stats.walletValue}</div>
            </div>
          </div>
          
          <button 
            onClick={handleStake}
            disabled={loading || !stakeAmount || parseFloat(stakeAmount) <= 0}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg mb-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Stake
          </button>
          
          <button 
            onClick={handleUnstake}
            disabled={loading || stats.userStaked <= 0}
            className="w-full text-center text-gray-400 hover:text-white py-2 transition-colors"
          >
            Unstake
          </button>
          
          <div className="mt-6">
            <input
              type="number"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
              placeholder="Amount to stake"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white outline-none focus:border-orange-500 transition-colors"
              disabled={loading}
            />
          </div>
        </div>
        
        {/* Total Staking Stats */}
        <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-lg p-6 relative overflow-hidden">
          <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
            <div className="text-blue-500 opacity-20">
              <svg width="160" height="160" viewBox="0 0 100 100">
                <path d="M50 0 L100 50 L50 100 L0 50 Z" fill="currentColor" />
              </svg>
            </div>
          </div>
          
          <div className="relative z-10">
            <h2 className="text-xl mb-4">Total Staked</h2>
            <div className="text-3xl font-bold text-blue-300 mb-1">
              {formatNumber(stats.totalStaked)} RON
            </div>
            <div className="text-lg text-gray-400 mb-8">
              ${formatNumber(stats.stakedValue)}
            </div>
            
            <h2 className="text-xl mb-4">Estimated Rewards</h2>
            <div className="text-3xl font-bold text-blue-300 mb-1">
              {stats.estimatedAPR}%
            </div>
            <div className="text-lg text-gray-400">
              APR
            </div>
          </div>
        </div>
      </div>
      
      {/* Status Message */}
      {status && (
        <div className={`mt-6 ${status.isError ? 'bg-red-900/50' : 'bg-green-900/50'} border ${status.isError ? 'border-red-700' : 'border-green-700'} rounded-lg p-4`}>
          <p className={status.isError ? 'text-red-400' : 'text-green-400'}>{status.message}</p>
        </div>
      )}
    </div>
  );
};

export default StakingDashboard;