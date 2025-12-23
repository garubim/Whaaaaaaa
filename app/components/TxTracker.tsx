"use client";

import { useEffect, useState, useRef } from 'react';
import { useChainId } from 'wagmi';

type TxEntry = {
  id: string;
  type: 'payment' | 'tx';
  createdAt: number;
  status: 'pending' | 'completed' | 'failed' | 'not_found';
  rpc?: string;
  testnet?: boolean;
};

const STORAGE_KEY = 'whaaaaa_txs_v1';

function readTxs(): TxEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as TxEntry[];
  } catch (e) {
    return [];
  }
}

function writeTxs(txs: TxEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(txs));
}

export default function TxTracker() {
  const [txs, setTxs] = useState<TxEntry[]>([]);
  const chainId = useChainId();
  const timer = useRef<number | null>(null);

  useEffect(() => {
    setTxs(readTxs());
  }, []);

  useEffect(() => {
    const interval = 10000; // 10s
    async function tick() {
      const current = readTxs();
      if (current.length === 0) return;
      const updated = await Promise.all(current.map(async (t) => {
        if (t.status !== 'pending') return t;
        try {
          if (t.type === 'payment') {
            // use SDK getPaymentStatus
            const sdk = await import('@base-org/account/payment');
            const { getPaymentStatus } = sdk;
            const status = await getPaymentStatus({ id: t.id, testnet: !!t.testnet });
            const raw = status?.status;
            const ok = raw === 'pending' || raw === 'completed' || raw === 'failed' || raw === 'not_found' ? raw : 'not_found';
            return { ...t, status: ok } as TxEntry;
          } else {
            // typical tx receipt check via RPC
            const rpc = t.rpc || (process.env.NEXT_PUBLIC_BASE_RPC || process.env.NEXT_PUBLIC_BASE_MAIN_RPC || '');
            if (!rpc) return t;
            const res = await fetch(rpc, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_getTransactionReceipt', params: [t.id] }) });
            const j = await res.json();
            if (j?.result) return { ...t, status: 'completed' };
            return t;
          }
        } catch (e) {
          return { ...t, status: 'not_found' };
        }
      }));
      writeTxs(updated as TxEntry[]);
      setTxs(updated as TxEntry[]);
    }

    tick();
    timer.current = window.setInterval(tick, interval);
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [chainId]);

  if (!txs || txs.length === 0) return null;

  return (
    <div style={{ marginTop: 12, width: '95%', background: 'rgba(0,0,0,0.6)', padding: 8, borderRadius: 8 }}>
      <div style={{ color: '#fff', fontWeight: 700, marginBottom: 6 }}>Transactions</div>
      {txs.map((t) => (
        <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', color: '#ddd', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
          <div style={{ maxWidth: '70%', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.id}</div>
          <div style={{ color: t.status === 'pending' ? '#ffd166' : t.status === 'completed' ? '#6bff6b' : '#ff6b6b' }}>{t.status}</div>
        </div>
      ))}
    </div>
  );
}
