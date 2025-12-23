"use client";

import { useState } from 'react';
import { useAccount, useWriteContract, useChainId, useSwitchChain } from 'wagmi';
import { base, sepolia } from 'viem/chains';
import { CONTRACT_ADDRESS as CONFIG_CONTRACT } from '../config/baseConfig';

type Props = {
  adminAddress?: string;
  functionName?: string;
  label?: string;
};

export default function AddAdminButton({
  adminAddress = '0x26dCd83d4e449059ABf0334e4435d48e74f28EB0',
  functionName = 'addMinter',
  label = 'Add Admin',
}: Props) {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { data: hash, writeContract, isPending } = useWriteContract();
  const [status, setStatus] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!isConnected) {
      setStatus('Connect wallet first');
      return;
    }
    // prefer Base mainnet, allow Sepolia if enabled by env var
    const allowSepolia = process.env.NEXT_PUBLIC_ALLOW_SEPOLIA === 'true';
    const allowed = chainId === base.id || (allowSepolia && chainId === sepolia.id);
    if (!allowed) {
      const target = allowSepolia ? sepolia.id : base.id;
      if (switchChain) switchChain({ chainId: target });
      setStatus(`Switch your wallet to ${allowSepolia ? 'Sepolia' : 'Base mainnet'}`);
      return;
    }

    setStatus('Sending admin tx...');
    try {
      writeContract?.({
        address: CONFIG_CONTRACT,
        abi: [
          { type: 'function', name: functionName, inputs: [{ name: 'who', type: 'address' }], stateMutability: 'nonpayable' },
        ],
        functionName,
        args: [adminAddress],
      });
    } catch (err: any) {
      setStatus(err?.message || String(err));
    }
  };

  return (
    <div style={{ position: 'fixed', right: 12, top: 12, zIndex: 999 }}>
      <button
        onClick={handleAdd}
        disabled={isPending}
        style={{
          padding: '8px 12px',
          borderRadius: 8,
          background: '#111827',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.06)',
          cursor: 'pointer',
        }}
      >
        {isPending ? 'Pending...' : label}
      </button>
      {status && <div style={{ marginTop: 6, color: '#fff', fontSize: 12 }}>{status}</div>}
    </div>
  );
}
