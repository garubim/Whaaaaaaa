"use client";

import { useEffect, useState } from 'react';
import { useChainId } from 'wagmi';

async function rpcRequest(rpc: string, method: string, params: any[] = []) {
  const res = await fetch(rpc, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  });
  return res.json();
}

export default function DebugPanel() {
  const chainId = useChainId();
  const [gasPrice, setGasPrice] = useState<string | null>(null);
  const [feeHistory, setFeeHistory] = useState<any>(null);
  const [rpc, setRpc] = useState<string | null>(null);

  useEffect(() => {
    // decide RPC from env vars exposed to client
    const baseRpc = (process.env.NEXT_PUBLIC_BASE_RPC || process.env.NEXT_PUBLIC_BASE_MAIN_RPC || '') as string;
    const sepoliaRpc = (process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC || process.env.NEXT_PUBLIC_SEPOLIA_RPC || '') as string;
    if (chainId === 8453) setRpc(baseRpc || null);
    else if (chainId === 11155111 || chainId === 111 || chainId === 1111) setRpc(sepoliaRpc || null);
    else setRpc(baseRpc || sepoliaRpc || null);
  }, [chainId]);

  const refresh = async () => {
    if (!rpc) return;
    try {
      const gp = await rpcRequest(rpc, 'eth_gasPrice');
      setGasPrice(gp?.result || null);
      const fh = await rpcRequest(rpc, 'eth_feeHistory', [5, 'latest', []]);
      setFeeHistory(fh?.result || null);
    } catch (e) {
      setGasPrice(null);
      setFeeHistory({ error: String(e) });
    }
  };

  useEffect(() => {
    refresh();
  }, [rpc]);

  return (
    <div style={{ position: 'fixed', left: 12, bottom: 12, zIndex: 1000, background: 'rgba(0,0,0,0.6)', padding: 12, color: '#fff', borderRadius: 8, fontSize: 12 }}>
      <div style={{ fontWeight: 700, marginBottom: 6 }}>Debug</div>
      <div>chainId: {chainId}</div>
      <div>rpc: {rpc || 'not configured'}</div>
      <div>gasPrice: {gasPrice ? String(gasPrice) : 'n/a'}</div>
      <div style={{ marginTop: 6 }}>
        <button onClick={refresh} style={{ padding: '6px 8px', borderRadius: 6, border: 'none', cursor: 'pointer' }}>Refresh</button>
      </div>
      <div style={{ maxWidth: 420, marginTop: 8 }}>
        <pre style={{ whiteSpace: 'pre-wrap', color: '#ddd' }}>{JSON.stringify(feeHistory, null, 2)}</pre>
      </div>
    </div>
  );
}
