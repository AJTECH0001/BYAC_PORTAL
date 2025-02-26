import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useAccount, useWalletClient } from 'wagmi';
import { ABI } from '../config/abi';

const CONTRACT_ADDRESS = 'YOUR_CONTRACT_ADDRESS_HERE';

const AdminInteraction: React.FC = () => {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [role, setRole] = useState<string>('');
  const [roleAddress, setRoleAddress] = useState<string>('');
  const [rewardAmount, setRewardAmount] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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

  const handleTransaction = async (action: () => Promise<void>, successMessage: string) => {
    if (!contract) return setMessage({ type: 'error', text: 'Contract not initialized' });

    try {
      setLoading(true);
      await action();
      setMessage({ type: 'success', text: successMessage });
    } catch (error: any) {
      console.error(error);
      setMessage({ type: 'error', text: error.message || 'Transaction failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleGrantRole = async () => {
    await handleTransaction(
      async () => {
        const tx = await contract!.grantRole(ethers.id(role), roleAddress);
        await tx.wait();
      },
      'Role granted successfully'
    );
  };

  const handleRevokeRole = async () => {
    await handleTransaction(
      async () => {
        const tx = await contract!.revokeRole(ethers.id(role), roleAddress);
        await tx.wait();
      },
      'Role revoked successfully'
    );
  };

  const handleDepositReward = async () => {
    await handleTransaction(
      async () => {
        const tx = await contract!.depositReward(ethers.parseUnits(rewardAmount, 18));
        await tx.wait();
      },
      'Reward deposited successfully'
    );
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-xl font-semibold mb-4">Admin Interaction</h1>
      <p className="text-gray-600 mb-4">Account: {address || 'Not connected'}</p>

      {message && (
        <div
          className={`p-3 mb-4 text-sm rounded ${
            message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="mb-4">
        <input
          type="text"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="Role"
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="mb-4">
        <input
          type="text"
          value={roleAddress}
          onChange={(e) => setRoleAddress(e.target.value)}
          placeholder="Address"
          className="w-full p-2 border rounded"
        />
      </div>

      <button
        onClick={handleGrantRole}
        disabled={!role || !roleAddress || loading}
        className="w-full p-2 bg-blue-500 text-white rounded mb-2 disabled:opacity-50"
      >
        {loading ? 'Processing...' : 'Grant Role'}
      </button>

      <button
        onClick={handleRevokeRole}
        disabled={!role || !roleAddress || loading}
        className="w-full p-2 bg-red-500 text-white rounded mb-4 disabled:opacity-50"
      >
        {loading ? 'Processing...' : 'Revoke Role'}
      </button>

      <div className="mb-4">
        <input
          type="text"
          value={rewardAmount}
          onChange={(e) => setRewardAmount(e.target.value)}
          placeholder="Amount to deposit"
          className="w-full p-2 border rounded"
        />
      </div>

      <button
        onClick={handleDepositReward}
        disabled={!rewardAmount || loading}
        className="w-full p-2 bg-green-500 text-white rounded disabled:opacity-50"
      >
        {loading ? 'Processing...' : 'Deposit Reward'}
      </button>
    </div>
  );
};

export default AdminInteraction;
