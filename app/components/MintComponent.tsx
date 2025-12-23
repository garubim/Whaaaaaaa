'use client';

import { useAccount, useWriteContract, useWaitForTransactionReceipt, useChainId, useSwitchChain, useDisconnect, useConnect } from 'wagmi';
import { Connected } from '@coinbase/onchainkit';
import { parseEther } from 'viem';
import { base, sepolia } from 'viem/chains';
import { useEffect, useState } from 'react';
import NFTImageDisplay from './NFTImageDisplay';
import BasePayButton from './BasePayButton';
import AddAdminButton from './AddAdminButton';
import DebugPanel from './DebugPanel';
import TxTracker from './TxTracker';
import { APP_SCALE, CONTRACT_ADDRESS } from '../config/baseConfig';

function ConnectButtonArea() {
  // Protect against hydration mismatch and DOM mutations caused by wallet browser
  // extensions by rendering a stable placeholder server-side and only mapping
  // connectors after the component has mounted on the client.
  const { connect, connectors, isLoading, pendingConnector } = useConnect();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Stable placeholder until client mounts
  if (!mounted) {
    return (
      <div style={{ display: 'flex', gap: 8, width: '95%', justifyContent: 'center' }}>
        <button style={{ ...styles.button, width: '100%', padding: '0.6rem 0.75rem' }}>Connect Wallet</button>
      </div>
    );
  }

  if (!connectors || connectors.length === 0) {
    return (
      <div style={{ display: 'flex', gap: 8, width: '95%', justifyContent: 'center' }}>
        <button style={{ ...styles.button, width: '100%', background: 'rgba(255,255,255,0.04)', color: '#fff' }}>
          No wallet connectors
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: 8, width: '95%', justifyContent: 'center' }}>
      {connectors.map((c) => (
        <button
          key={c.id}
          onClick={() => connect({ connector: c })}
          disabled={!c.ready}
          style={{
            flex: 1,
            padding: '0.6rem 0.75rem',
            borderRadius: 10,
            background: c.ready ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)',
            color: '#fff',
            border: 'none',
            fontSize: '0.95rem',
            cursor: c.ready ? 'pointer' : 'not-allowed',
          }}
        >
          {isLoading && pendingConnector?.id === c.id ? `${c.name} (connecting...)` : c.name}
        </button>
      ))}
    </div>
  );
}

const MINT_PRICE = '0.0003'; 

const CONTRACT_ABI = [
  {
    type: 'function',
    name: 'mint',
    inputs: [],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'payAndMint',
    inputs: [
      { name: '_artistContract', type: 'address' },
      { name: '_to', type: 'address' },
      { name: '_paymentId', type: 'string' },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
];

export default function MintComponent() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { disconnect } = useDisconnect();
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { data: hash, writeContract, isPending: isMinting, error: writeError } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (writeError) {
      setError(writeError.message || 'Minting failed. Please try again.');
      setSuccessMessage(null);
    }
    if (isConfirmed) {
      setSuccessMessage(`Success! You Ëngraved the chain! Transaction: ${hash?.substring(0, 6)}...${hash?.slice(-4)}`);
      setError(null);
    }
  }, [writeError, isConfirmed, hash]);

  // persist tx to tracker when writeContract produces a hash
  useEffect(() => {
    if (!hash) return;
    try {
      const raw = localStorage.getItem('whaaaaa_txs_v1');
      const arr = raw ? JSON.parse(raw) : [];
      arr.unshift({ id: hash, type: 'tx', createdAt: Date.now(), status: 'pending', rpc: process.env.NEXT_PUBLIC_BASE_RPC || process.env.NEXT_PUBLIC_BASE_MAIN_RPC || '' });
      localStorage.setItem('whaaaaa_txs_v1', JSON.stringify(arr));
    } catch (e) {
      // ignore
    }
  }, [hash]);

  const handleMint = () => {
    if (!isConnected) {
      setError('Please connect your wallet first.');
      return;
    }
    // Allow Base mainnet by default. If NEXT_PUBLIC_ALLOW_SEPOLIA is "true",
    // permit testing on Sepolia as well (minimal, opt-in for local/dev testing).
    const allowSepolia = process.env.NEXT_PUBLIC_ALLOW_SEPOLIA === 'true';
    const allowed = chainId === base.id || (allowSepolia && chainId === sepolia.id);
    if (!allowed) {
      const targetChain = allowSepolia ? sepolia.id : base.id;
      const human = allowSepolia ? 'Sepolia (testnet)' : 'Base mainnet (chain 8453)';
      if (switchChain) {
        switchChain({ chainId: targetChain });
        setError(`Por favor, mude sua carteira para ${human}.`);
      } else {
        setError(`Por favor, mude sua carteira para ${human}.`);
      }
      return;
    }
    setError(null);
    setSuccessMessage(null);
    // Prefer Gallery.payAndMint flow when gallery + mfer addresses are configured
    const galleryAddr = process.env.NEXT_PUBLIC_GALLERY_ADDRESS || '';
    const mferAddr = process.env.NEXT_PUBLIC_MFER_ADDRESS || process.env.NEXT_PUBLIC_MFER || '';
    const toAddr = process.env.NEXT_PUBLIC_ARTIST_ADDRESS || process.env.NEXT_PUBLIC_ARTIST || process.env.NEXT_PUBLIC_TO_ADDRESS || '';
    const paymentId = `frontend-${Date.now()}`;

    if (galleryAddr && mferAddr && toAddr) {
      writeContract({
        address: galleryAddr,
        abi: CONTRACT_ABI,
        functionName: 'payAndMint',
        args: [mferAddr, toAddr, paymentId],
        value: parseEther(MINT_PRICE),
      });
      return;
    }

    // Fallback: call mint directly on configured contract
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'mint',
      value: parseEther(MINT_PRICE),
    });
  };

  const nftMetadata = {
    name: 'Mfer',
    description: 'This is not animation; it\'s a <strong>ritual</strong>',
    attributes: [
      { trait_type: 'Collection', value: 'Mfer-0-base' },
      { trait_type: 'Chain', value: 'Base' },
      { trait_type: 'The soul spins at ', value: 'This base is where that smile comes home.' },
    ],
  };

  const [method, setMethod] = useState<'wallet' | 'basepay'>('wallet');
  const [receiptInfo, setReceiptInfo] = useState<any>(null);
  const [useOnchainKit, setUseOnchainKit] = useState(false);
  const [lastPaymentId, setLastPaymentId] = useState<string | null>(null);
  const [lastPaymentSdkId, setLastPaymentSdkId] = useState<string | null>(null);

  const checkReceipt = async (txHash?: string) => {
    if (!txHash) return;
    // pick rpc from envs
    const baseRpc = process.env.NEXT_PUBLIC_BASE_RPC || process.env.NEXT_PUBLIC_BASE_MAIN_RPC || '';
    const sepoliaRpc = process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC || process.env.NEXT_PUBLIC_SEPOLIA_RPC || '';
    const rpc = chainId === base.id ? baseRpc || '' : sepolia.id === chainId ? sepoliaRpc || '' : baseRpc || sepoliaRpc || '';
    if (!rpc) {
      setReceiptInfo({ error: 'No RPC configured in env (NEXT_PUBLIC_BASE_RPC / NEXT_PUBLIC_BASE_SEPOLIA_RPC).' });
      return;
    }
    try {
      const res = await fetch(rpc, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_getTransactionReceipt', params: [txHash] }),
      });
      const json = await res.json();
      setReceiptInfo(json.result || json);
    } catch (e) {
      setReceiptInfo({ error: String(e) });
    }
  };

  return (
    <div style={styles.container}>
      <AddAdminButton />
      <DebugPanel />
      <div style={{ ...styles.verticalContent }}>

        {/* Payment method selector moved up to let user choose first */}
        <div style={{ width: '100%', margin: '0.6rem 0 0.25rem 0', display: 'flex', justifyContent: 'center' }}>
          <div style={{ display: 'flex', gap: 8, width: '95%', justifyContent: 'center' }}>
            <button onClick={() => setMethod('wallet')} style={{ flex: 1, padding: '8px', borderRadius: 8, background: method === 'wallet' ? '#005bea' : 'rgba(255,255,255,0.06)', color: '#fff', border: 'none' }}>Wallet</button>
            <button onClick={() => setMethod('basepay')} style={{ flex: 1, padding: '8px', borderRadius: 8, background: method === 'basepay' ? '#00c6fb' : 'rgba(255,255,255,0.06)', color: '#fff', border: 'none' }}>Base Pay</button>
          </div>
        </div>

        <div style={{ width: '100%', margin: '0.6rem 0 0.25rem 0', display: 'flex', justifyContent: 'center' }}>
          {/* Show connect UI only when Wallet method selected. BasePay flow does not require on-page wallet connect. */}
          {method === 'wallet' ? (
            !isConnected ? (
              <ConnectButtonArea />
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem', width: '95%', justifyContent: 'center' }}>
                <button
                  onClick={() => disconnect()}
                  style={{
                    ...styles.button,
                    fontSize: '1.0rem',
                    borderRadius: '10px',
                    padding: '0.6rem 1rem',
                    background: 'rgba(255,255,255,0.06)',
                    color: '#fff',
                    width: 'auto',
                  }}
                >
                  Disconnect
                </button>
                <div style={{ alignSelf: 'center', color: '#fff' }}>{address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''}</div>
              </div>
            )
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center', width: '95%' }}>
              <div style={{ color: '#9fdcee' }}>Base Pay selected — use the Base Pay widget below to complete the payment (no wallet connect required).</div>
            </div>
          )}
        </div>


        <div style={styles.imageSection}>
          <NFTImageDisplay metadata={nftMetadata} />
        </div>

        {/* Payment method selector */}
        <div style={{ width: '100%', margin: '0.6rem 0 0.6rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}> 
          <div style={{ display: 'flex', gap: 8, marginBottom: 8, width: '95%' }}>
            <button onClick={() => setMethod('wallet')} style={{ flex: 1, padding: '8px', borderRadius: 8, background: method === 'wallet' ? '#005bea' : 'rgba(255,255,255,0.06)', color: '#fff', border: 'none' }}>Wallet Mint</button>
            <button onClick={() => setMethod('basepay')} style={{ flex: 1, padding: '8px', borderRadius: 8, background: method === 'basepay' ? '#00c6fb' : 'rgba(255,255,255,0.06)', color: '#fff', border: 'none' }}>Base Pay</button>
          </div>

          <div style={{ width: '95%' }}>
            {method === 'wallet' && (
              <button
                onClick={handleMint}
                disabled={!isConnected || isMinting || isConfirming}
                style={{
                  ...styles.button,
                  fontSize: '1.05rem',
                  padding: '0.8rem 0',
                  borderRadius: '12px',
                  width: '100%',
                  background: 'linear-gradient(90deg, #00c6fb 0%, #005bea 100%)',
                  color: '#fff',
                }}
              >
                {isMinting && 'Transaction sent — awaiting wallet confirm...'}
                {isConfirming && 'On-chain: minting...'}
                {!isMinting && !isConfirming && (useOnchainKit ? 'Mint (OnchainKit)' : 'Mint NFT (Wallet)')}
              </button>
            )}
            {method === 'basepay' && (
              <div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <label style={{ color: '#fff', alignSelf: 'center' }}>
                    <input type="checkbox" checked={useOnchainKit} onChange={(e) => setUseOnchainKit(e.target.checked)} /> Use Farcaster / OnchainKit
                  </label>
                </div>
                <BasePayButton
                  amountEth={MINT_PRICE}
                  to={process.env.NEXT_PUBLIC_GALLERY_ADDRESS || CONTRACT_ADDRESS}
                  onSuccess={(paymentId, sdkId) => {
                    setLastPaymentId(paymentId || null);
                    setLastPaymentSdkId(sdkId || null);
                    setSuccessMessage(`Submitted via Base Pay: ${paymentId}${sdkId ? ` (sdk:${sdkId})` : ''}`);
                    try {
                      const raw = localStorage.getItem('whaaaaa_payments_v1');
                      const arr = raw ? JSON.parse(raw) : [];
                      arr.unshift({ paymentId, sdkId: sdkId || null, to: process.env.NEXT_PUBLIC_GALLERY_ADDRESS || CONTRACT_ADDRESS, amountEth: MINT_PRICE, createdAt: Date.now(), status: 'pending' });
                      localStorage.setItem('whaaaaa_payments_v1', JSON.stringify(arr));
                    } catch (e) {}
                    try {
                      const raw2 = localStorage.getItem('whaaaaa_txs_v1');
                      const arr2 = raw2 ? JSON.parse(raw2) : [];
                      arr2.unshift({ id: paymentId, type: 'payment', createdAt: Date.now(), status: 'pending', sdkId: sdkId || null });
                      localStorage.setItem('whaaaaa_txs_v1', JSON.stringify(arr2));
                    } catch (e) {}
                  }}
                  onError={(e) => setError(e?.message || String(e))}
                />
              </div>
            )}
          </div>

          {/* Tx tracking */}
          <div style={{ marginTop: 10, width: '95%' }}>
            {hash && (
              <div style={{ color: '#fff' }}>
                <div>Tx: <a href={(process.env.NEXT_PUBLIC_EXPLORER_TX || 'https://basescan.org/tx/') + hash} target="_blank" rel="noreferrer" style={{ color: '#9fdcee' }}>{hash}</a></div>
                <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                  <button onClick={() => checkReceipt(hash)} style={{ padding: '6px 8px', borderRadius: 6 }}>Check receipt</button>
                  <a href={(process.env.NEXT_PUBLIC_EXPLORER_TX || 'https://basescan.org/tx/') + hash} target="_blank" rel="noreferrer"><button style={{ padding: '6px 8px', borderRadius: 6 }}>Open explorer</button></a>
                </div>
                {receiptInfo && <pre style={{ color: '#ddd', whiteSpace: 'pre-wrap', marginTop: 8 }}>{JSON.stringify(receiptInfo, null, 2)}</pre>}
              </div>
            )}

            {lastPaymentId && (
              <div style={{ marginTop: 8, color: '#fff' }}>
                <div>Payment id: <span style={{ color: '#9fdcee' }}>{lastPaymentId}</span></div>
                {lastPaymentSdkId && <div style={{ marginTop: 6 }}>Provider id: <span style={{ color: '#9fdcee' }}>{lastPaymentSdkId}</span></div>}
                <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                  <button onClick={() => { navigator.clipboard?.writeText(lastPaymentId || ''); }} style={{ padding: '6px 8px', borderRadius: 6 }}>Copy id</button>
                  <button onClick={() => { try { const raw = localStorage.getItem('whaaaaa_payments_v1'); const arr = raw?JSON.parse(raw):[]; alert(JSON.stringify(arr.slice(0,5),null,2)); } catch(e){ alert('no data') } }} style={{ padding: '6px 8px', borderRadius: 6 }}>Show recent payments</button>
                </div>
              </div>
            )}
            <TxTracker />
          </div>
        </div>

        {/* Mensagens de erro/sucesso */}
        {error && <p style={styles.warning}>⚠️ {error}</p>}
        {successMessage && <p style={styles.success}>✅ {successMessage}</p>}

        {/* Detalhes integrados: Collection, Chain, Address, Price, Wallet, The soul spins at */}
        <div style={{ ...styles.contractInfo, marginTop: '0.0rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontWeight: 600 }}>Collection</span>
            <span style={{ color: '#00e6ff', fontWeight: 600 }}>Mfer-bk-0-base</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontWeight: 600 }}>Chain</span>
            <span style={{ color: '#00e6ff', fontWeight: 600 }}>Base</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontWeight: 600 }}>Address</span>
            <code style={{ ...styles.addressCode, background: 'none', padding: 0, color: '#fff' }}>{CONTRACT_ADDRESS.slice(0, 8)}...{CONTRACT_ADDRESS.slice(-6)}</code>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontWeight: 600 }}>Price</span>
            <span style={{ ...styles.price, color: '#fff' }}>{MINT_PRICE} ETH</span>
          </div>
          {isConnected && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontWeight: 600 }}>Wallet</span>
              <code style={{ ...styles.addressCode, background: 'none', padding: 0, color: '#fff' }}>{address?.slice(0, 10)}...</code>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 0 }}>
            <span style={{ fontWeight: 600 }}>The soul spins at</span>
            <span style={{ color: '#00e6ff', fontWeight: 600 }}>This base is where that smile comes home.</span>
          </div>
        </div>


      </div>

      <style jsx>{`'main'
        code {
          font-family: 'Inter';
          font-size: 0.85rem;
          word-break: break-all;
        }

        small {
          color: #aaa;
          font-size: 0.75rem;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    width: '100%',
    maxWidth: '1200px',
    padding: '0.0rem',
  },
  verticalContent: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center' as const,
    gap: '0rem',
    width: '100%',
    maxWidth: '640px',
    margin: '0 auto',
  },
  imageSection: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
  },
  controlsSection: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    gap: '1.5rem',
  },
  contractInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '12px',
    padding: '1.5rem',
    color: 'white',
  },
  addressCode: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: '0.5rem',
    borderRadius: '4px',
    display: 'block',
    marginTop: '0.1rem',
    wordBreak: 'break-all' as const,
  },
  price: {
    fontSize: '1.5rem',
    fontWeight: 'bold' as const,
    color: '#00ffff',
  },
  buttonGroup: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    gap: '1rem',
  },
  button: {
    padding: '1rem 2rem',
    fontSize: '1.1rem',
    fontWeight: 'bold' as const,
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#00ffff',
    color: '#333',
    cursor: 'pointer' as const,
    transition: 'all 0.3s ease',
    width: '100%',
  },
  buttonDisabled: {
    backgroundColor: '#888',
    color: '#ddd',
    cursor: 'not-allowed' as const,
    opacity: 0.6,
  },
  warning: {
    color: '#ffaa00',
    textAlign: 'center' as const,
    padding: '1rem',
    backgroundColor: 'rgba(255, 170, 0, 0.1)',
    borderRadius: '8px',
    fontSize: '0.95rem',
  },
  success: {
    color: '#6bff6b',
    textAlign: 'center' as const,
    padding: '1rem',
    backgroundColor: 'rgba(107, 255, 107, 0.1)',
    border: '1px solid rgba(107, 255, 107, 0.2)',
    borderRadius: '8px',
    fontSize: '0.95rem',
    wordBreak: 'break-word' as const,
  },
  spinnerSmall: {
    width: '18px',
    height: '18px',
    border: '3px solid rgba(255,255,255,0.2)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    animation: 'spin 0.9s linear infinite',
  },
};
