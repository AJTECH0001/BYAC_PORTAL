import React, { useState, useMemo } from 'react';
import { useAccount, useBalance, useContractRead, useContractWrite } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { Coins, Wallet, Award, TrendingUp, LockIcon, Calendar } from 'lucide-react';

interface WalletStatus {
  isInstalled: boolean;
  isReady: boolean;
}

interface StakingDashboardProps {
  walletStatus: WalletStatus;
}

interface StakingOption {
  days: number;
  apr: number;
  minAmount: number;
}

// Contract addresses
const BRAIDS_TOKEN_ADDRESS = '0xD144A6466aA76Cc3A892Fda9602372dd884a2C90';
const STAKING_POOL_ADDRESS = '0xA1c342b4764504989606D3f66986F695DfdaF97e';

const stakingOptions: StakingOption[] = [
  { days: 30, apr: 10, minAmount: 100 },
  { days: 60, apr: 25, minAmount: 250 },
  { days: 90, apr: 30, minAmount: 500 },
];

const StakingDashboard: React.FC<StakingDashboardProps> = ({ walletStatus }) => {
  const { address, isConnected } = useAccount();
  const [stakeAmount, setStakeAmount] = useState('');
  const [selectedOption, setSelectedOption] = useState<StakingOption | null>(null);
  const [unstakeAmount, setUnstakeAmount] = useState('');

  // Calculate potential rewards
  const potentialRewards = useMemo(() => {
    if (!selectedOption || !stakeAmount || isNaN(Number(stakeAmount))) return 0;
    const amount = Number(stakeAmount);
    const yearlyReward = amount * (selectedOption.apr / 100);
    const periodReward = yearlyReward * (selectedOption.days / 365);
    return periodReward;
  }, [selectedOption, stakeAmount]);

  // Format balance to standard numeric format
  const formatBalance = (balance: bigint | undefined): string => {
    if (!balance) return '0.00';
    const formatted = formatEther(balance);
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    }).format(Number(formatted));
  };

  // Contract reads
  const { data: braidsBalance } = useBalance({
    address,
    token: BRAIDS_TOKEN_ADDRESS as `0x${string}`,
  });

  const { data: stakedAmount } = useContractRead({
    address: STAKING_POOL_ADDRESS as `0x${string}`,
    abi: [{
      name: 'balanceOf',
      type: 'function',
      stateMutability: 'view',
      inputs: [{ name: 'account', type: 'address' }],
      outputs: [{ name: '', type: 'uint256' }],
    }],
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    enabled: !!address,
  });

  // Contract writes
  const { writeAsync: stake } = useContractWrite({
    address: STAKING_POOL_ADDRESS as `0x${string}`,
    abi: [{
      name: 'stake',
      type: 'function',
      stateMutability: 'nonpayable',
      inputs: [{ name: 'amount', type: 'uint256' }, { name: 'lockPeriod', type: 'uint256' }],
      outputs: [],
    }],
    functionName: 'stake',
  });

  const { writeAsync: unstake } = useContractWrite({
    address: STAKING_POOL_ADDRESS as `0x${string}`,
    abi: [{
      name: 'unstake',
      type: 'function',
      stateMutability: 'nonpayable',
      inputs: [{ name: 'amount', type: 'uint256' }],
      outputs: [],
    }],
    functionName: 'unstake',
  });

  const handleMaxStake = () => {
    if (!braidsBalance?.value) return;
    setStakeAmount(formatEther(braidsBalance.value));
  };

  const handleMaxUnstake = () => {
    if (!stakedAmount) return;
    setUnstakeAmount(formatEther(stakedAmount));
  };

  const handleStake = async () => {
    if (!stakeAmount || !selectedOption) return;
    try {
      await stake({ 
        args: [
          parseEther(stakeAmount),
          BigInt(selectedOption.days * 24 * 60 * 60) // Convert days to seconds
        ] 
      });
      setStakeAmount('');
      setSelectedOption(null);
    } catch (err) {
      console.error('Staking failed:', err);
    }
  };

  const handleUnstake = async () => {
    if (!unstakeAmount) return;
    try {
      await unstake({ args: [parseEther(unstakeAmount)] });
      setUnstakeAmount('');
    } catch (err) {
      console.error('Unstaking failed:', err);
    }
  };

  if (!walletStatus.isInstalled) {
    return (
      <div className="text-center py-20">
        <Wallet className="h-16 w-16 mx-auto text-gray-400 mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Ronin Wallet Required</h2>
        <p className="text-gray-400 mb-4">Please install Ronin Wallet to access the dashboard</p>
        <a
          href="https://wallet.roninchain.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        >
          Install Ronin Wallet
        </a>
      </div>
    );
  }

  if (!walletStatus.isReady) {
    return (
      <div className="text-center py-20">
        <Wallet className="h-16 w-16 mx-auto text-gray-400 mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Unlock Your Wallet</h2>
        <p className="text-gray-400">Please unlock your Ronin Wallet to continue</p>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="text-center py-20">
        <Wallet className="h-16 w-16 mx-auto text-gray-400 mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Connect Your Wallet</h2>
        <p className="text-gray-400">Please connect your wallet to view the staking dashboard</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Wallet Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">$BRAIDS Balance</span>
            <Coins className="h-5 w-5 text-purple-400" />
          </div>
          <div className="text-xl font-semibold">
            {formatBalance(braidsBalance?.value)} BRAIDS
          </div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Total Staked</span>
            <LockIcon className="h-5 w-5 text-green-400" />
          </div>
          <div className="text-xl font-semibold">
            {formatBalance(stakedAmount)} BRAIDS
          </div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Current APR</span>
            <TrendingUp className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="text-xl font-semibold">
            {selectedOption ? `${selectedOption.apr}%` : 'Select Period'}
          </div>
        </div>
      </div>

      {/* Staking Pool */}
      <div className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 rounded-lg p-8 backdrop-blur-sm border border-purple-500/20">
        <h2 className="text-2xl font-bold mb-6">$BRAIDS Staking Pool</h2>

        {/* Staking Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stakingOptions.map((option, index) => (
            <button
              key={index}
              onClick={() => setSelectedOption(option)}
              className={`p-6 rounded-lg border transition-all ${
                selectedOption === option
                  ? 'bg-purple-900/50 border-purple-500'
                  : 'bg-gray-800/50 border-gray-700 hover:border-purple-500/50'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <Calendar className="h-6 w-6 text-purple-400" />
                <span className="text-2xl font-bold text-purple-400">{option.apr}%</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">{option.days} Days Lock</h3>
              <p className="text-sm text-gray-400">Min. {option.minAmount} BRAIDS</p>
              {selectedOption === option && (
                <div className="mt-2 inline-block px-2 py-1 bg-purple-500/20 rounded-full text-purple-300 text-sm">
                  Selected
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Stake */}
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold mb-4">Stake $BRAIDS</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Amount to Stake
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={stakeAmount}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || /^\d*\.?\d*$/.test(value)) {
                        setStakeAmount(value);
                      }
                    }}
                    placeholder="0.000000"
                    className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    onClick={handleMaxStake}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                  >
                    MAX
                  </button>
                </div>
              </div>

              {/* Potential Rewards */}
              {selectedOption && stakeAmount && Number(stakeAmount) > 0 && (
                <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-purple-300">Potential Rewards</span>
                    <Award className="h-5 w-5 text-purple-400" />
                  </div>
                  <div className="text-lg font-semibold text-purple-300">
                    {formatBalance(BigInt(Math.floor(potentialRewards * 1e18)))} BRAIDS
                  </div>
                  <p className="text-xs text-purple-400 mt-1">
                    Estimated rewards after {selectedOption.days} days at {selectedOption.apr}% APR
                  </p>
                </div>
              )}

              <button
                onClick={handleStake}
                disabled={
                  !stakeAmount || 
                  !selectedOption || 
                  Number(stakeAmount) < selectedOption.minAmount ||
                  !braidsBalance?.value ||
                  parseEther(stakeAmount) > braidsBalance.value
                }
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors"
              >
                {!selectedOption 
                  ? 'Select Lock Period'
                  : !stakeAmount 
                    ? 'Enter Amount'
                    : Number(stakeAmount) < selectedOption.minAmount
                      ? `Min. ${selectedOption.minAmount} BRAIDS Required`
                      : braidsBalance?.value && parseEther(stakeAmount) > braidsBalance.value
                        ? 'Insufficient Balance'
                        : 'Stake BRAIDS'}
              </button>
              {selectedOption && (
                <p className="text-sm text-gray-400 text-center">
                  Your tokens will be locked for {selectedOption.days} days
                </p>
              )}
            </div>
          </div>

          {/* Unstake */}
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold mb-4">Unstake $BRAIDS</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Amount to Unstake
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={unstakeAmount}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || /^\d*\.?\d*$/.test(value)) {
                        setUnstakeAmount(value);
                      }
                    }}
                    placeholder="0.000000"
                    className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    onClick={handleMaxUnstake}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                  >
                    MAX
                  </button>
                </div>
              </div>
              <button
                onClick={handleUnstake}
                disabled={
                  !unstakeAmount ||
                  !stakedAmount ||
                  parseEther(unstakeAmount) > stakedAmount
                }
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors"
              >
                {!unstakeAmount
                  ? 'Enter Amount'
                  : stakedAmount && parseEther(unstakeAmount) > stakedAmount
                    ? 'Insufficient Staked Balance'
                    : 'Unstake BRAIDS'}
              </button>
              <p className="text-sm text-gray-400 text-center">
                You can only unstake after the lock period ends
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StakingDashboard;