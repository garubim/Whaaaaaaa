"use client";

import { useState } from 'react';
import { useChainId } from 'wagmi';

type Props = {
  amountEth?: string; // optional ETH amount (string like '0.0003')
  amountUSD?: string; // optional USD amount (string like '1.50')
  to?: string; // recipient address (optional)
  // onSuccess receives frontend `paymentId` and optional sdk `id`
  onSuccess?: (paymentId: string, sdkId?: string) => void;
  onError?: (err: any) => void;
};

async function fetchEthUsdPrice() {
  try {
    const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
    const j = await res.json();
    return Number(j?.ethereum?.usd) || null;
  } catch (e) {
    return null;
  }
}

export default function BasePayButton({ amountEth, amountUSD, to, onSuccess, onError }: Props) {
  const [status, setStatus] = useState<string | null>(null);
  const chainId = useChainId();

  const handleBasePay = async () => {
    setStatus('Preparing Base Pay...');
    try {
      const allowSepolia = process.env.NEXT_PUBLIC_ALLOW_SEPOLIA === 'true';
      const testnet = allowSepolia; // opt-in testnet mode via env

      // Resolve USD amount
      let usdAmount: string | null = amountUSD || null;
      if (!usdAmount && amountEth) {
        setStatus('Converting ETH → USD...');
        const price = await fetchEthUsdPrice();
        if (!price) {
          throw new Error('Failed to fetch ETH price (CoinGecko)');
        }
        usdAmount = (Number(amountEth) * price).toFixed(2);
      }
      if (!usdAmount) throw new Error('No amount provided for Base Pay (amountUSD or amountEth required)');

      setStatus('Opening Base Pay...');
      const sdk = await import('@base-org/account/payment');
      const { pay } = sdk as any;
      if (!pay) throw new Error('Base Pay API not available');

      // Detailed debug: log input values before calling SDK
      // eslint-disable-next-line no-console
      console.debug('BasePay: calling pay() with', { usdAmount, to, testnet });

      // frontend-generated id to correlate UI <-> relayer
      const paymentId = `bp-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;

      let paymentResult: any = null;
      try {
        paymentResult = await pay({ amount: String(usdAmount), to: to || '', testnet });
        // eslint-disable-next-line no-console
        console.debug('BasePay: paymentResult', paymentResult);
      } catch (sdkErr) {
        // SDK-level error (network, CORS, etc.) — rethrow after logging
        // eslint-disable-next-line no-console
        console.error('BasePay: SDK threw error', sdkErr);
        throw sdkErr;
      }

      const sdkId = paymentResult?.id || null;

      // persist mapping in localStorage so relayer / UI can reconcile
      try {
        const raw = localStorage.getItem('whaaaaa_payments_v1');
        const arr = raw ? JSON.parse(raw) : [];
        arr.unshift({ paymentId, sdkId, to: to || '', amountUSD: usdAmount, createdAt: Date.now(), status: sdkId ? 'submitted' : 'started' });
        localStorage.setItem('whaaaaa_payments_v1', JSON.stringify(arr));
      } catch (e) {
        // ignore storage errors
      }

      if (sdkId) {
        setStatus('Payment submitted');
        onSuccess?.(paymentId, sdkId);
      } else {
        setStatus('Payment started — check wallet');
        onSuccess?.(paymentId, undefined);
      }
    } catch (err) {
      setStatus(`Error: ${err instanceof Error ? err.message : String(err)}`);
      // eslint-disable-next-line no-console
      console.error('Base Pay error', err);
      onError?.(err);
    }
  };

  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center', flexDirection: 'column' as const, alignItems: 'center' }}>
      <button
        onClick={handleBasePay}
        style={{
          padding: '0.9rem 1rem',
          borderRadius: 12,
          width: '95%',
          background: 'linear-gradient(90deg,#00c6fb 0%,#005bea 100%)',
          color: '#fff',
          fontWeight: '700',
          border: 'none',
        }}
      >
        Pay with Base Pay
      </button>
      {status && <div style={{ marginTop: 8, color: '#fff' }}>{status}</div>}
    </div>
  );
}

