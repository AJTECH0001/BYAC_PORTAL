import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useAccount, useWalletClient } from 'wagmi';
import { ABI } from '../config/abi';

const CONTRACT_ADDRESS = 'YOUR_CONTRACT_ADDRESS_HERE';

const UserInteraction: React.FC = () => {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [stakeAmount, setStakeAmount] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    const setupContract = async () => {
      if (walletClient) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const tempContract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
        setContract(tempContract);
      }
    };
    setupContract();
  }, [walletClient]);

  const handleTransaction = async (action: () => Promise<any>, successMessage: string) => {
    if (!contract) return setStatus('❌ Contract not initialized.');
    setLoading(true);
    setStatus('⏳ Processing...');
    try {
      const tx = await action();
      await tx.wait();
      setStatus(`✅ ${successMessage}`);
    } catch (error: any) {
      console.error(error);
      setStatus(`❌ ${error.reason || 'Transaction failed'}`);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-gray-100 shadow-lg rounded-lg">
      <h1 className="text-xl font-bold text-center mb-4">User Interaction</h1>
      <p className="text-center text-gray-600 mb-4">
        Account: <span className="font-semibold">{address || 'Not connected'}</span>
      </p>

      <input
        type="number"
        value={stakeAmount}
        onChange={(e) => setStakeAmount(e.target.value)}
        placeholder="Amount to stake"
        className="w-full p-2 border rounded mb-3"
        disabled={loading}
      />

      <div className="grid grid-cols-2 gap-2 mb-4">
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded disabled:bg-gray-400"
          onClick={() => handleTransaction(() => contract!.stake(ethers.parseUnits(stakeAmount, 18)), 'Stake successful')}
          disabled={loading || !stakeAmount || Number(stakeAmount) <= 0}
        >
          {loading ? 'Staking...' : 'Stake'}
        </button>
        <button
          className="bg-red-500 hover:bg-red-600 text-white p-2 rounded disabled:bg-gray-400"
          onClick={() => handleTransaction(() => contract!.withdraw(), 'Withdraw successful')}
          disabled={loading}
        >
          {loading ? 'Withdrawing...' : 'Withdraw'}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <button
          className="bg-gray-500 hover:bg-gray-600 text-white p-2 rounded disabled:bg-gray-400"
          onClick={() => handleTransaction(() => contract!.exit(), 'Exit successful')}
          disabled={loading}
        >
          {loading ? 'Exiting...' : 'Exit'}
        </button>
        <button
          className="bg-green-500 hover:bg-green-600 text-white p-2 rounded disabled:bg-gray-400"
          onClick={() => handleTransaction(() => contract!.getReward(), 'Claim successful')}
          disabled={loading}
        >
          {loading ? 'Claiming...' : 'Claim'}
        </button>
      </div>

      <button
        className="w-full bg-purple-500 hover:bg-purple-600 text-white p-2 rounded disabled:bg-gray-400"
        onClick={async () => {
          await handleTransaction(() => contract!.getReward(), 'Claim successful');
          await handleTransaction(() => contract!.stake(ethers.parseUnits(stakeAmount, 18)), 'Restake successful');
        }}
        disabled={loading || !stakeAmount || Number(stakeAmount) <= 0}
      >
        {loading ? 'Restaking...' : 'Restake'}
      </button>

      {status && <p className="mt-4 text-center text-sm font-semibold">{status}</p>}
    </div>
  );
};

export default UserInteraction;
