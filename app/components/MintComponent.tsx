'use client';

import { useAccount, useWriteContract, useWaitForTransactionReceipt, useChainId, useSwitchChain, useDisconnect } from 'wagmi';
import { Connected } from '@coinbase/onchainkit';
import { parseEther } from 'viem';
import { base } from 'viem/chains';
import { useEffect, useState } from 'react';
import NFTImageDisplay from './NFTImageDisplay';

const CONTRACT_ADDRESS = '0x86a34dFaB59996C6fB809D1F2B016a0eD397E682' as const;
const MINT_PRICE = '0.0003'; 

const CONTRACT_ABI = [
  {
    type: 'function',
    name: 'mint',
    inputs: [],
    outputs: [],
    stateMutability: 'payable',
  },
];

export default function MintComponent() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { connect, connectors } = useConnect();
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

  const handleMint = () => {
    if (!isConnected) {
      setError('Please connect your wallet first.');
      return;
    }
    // Ensure the wallet is on Base mainnet (chain id 8453)
    if (chainId !== base.id) {
      if (switchChain) {
        switchChain({ chainId: base.id });
        setError('Por favor, mude sua carteira para Base mainnet (chain 8453).');
      } else {
        setError('Por favor, mude sua carteira para Base mainnet (chain 8453).');
      }
      return;
    }
    setError(null);
    setSuccessMessage(null);
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'mint',
      value: parseEther(MINT_PRICE),
    });
  };

  const nftMetadata = {
    name: 'Mfer 1',
    description: 'Whaaa?! Mfer-0-base - Exclusive NFT Collection on Base',
    attributes: [
      { trait_type: 'Collection', value: 'Mfer-0-base' },
      { trait_type: 'Chain', value: 'Base' },
      { trait_type: 'The soul spins at ', value: 'This base is where that smile comes home.' },
    ],
  };

  return (
    <div style={styles.container}>
      <div style={styles.verticalContent}>

        {/* Use OnchainKit Connected component: shows OnchainKit connect UI (modal) when disconnected */}
        <div style={{ width: '100%', margin: '1.2rem 0 0.5rem 0', display: 'flex', justifyContent: 'center' }}>
          <Connected>
            <button
              onClick={() => disconnect()}
              style={{
                ...styles.button,
                fontSize: '1.1rem',
                borderRadius: '10px',
                width: '95%',
                background: 'linear-gradient(90deg, #00c6fb 0%, #005bea 100%)',
                color: '#fff',
                margin: '0 auto',
              }}
            >
              {address ? `Connected: ${address.slice(0, 6)}...${address.slice(-4)}` : 'Connected'} (Disconnect)
            </button>
          </Connected>
        </div>


        <div style={styles.imageSection}>
          <NFTImageDisplay metadata={nftMetadata} />
        </div>

        {/* Botão Mint destacado, logo abaixo da imagem */}
        <div style={{ width: '100%', margin: '1.2rem 0 1.2rem 0', display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={handleMint}
            disabled={!isConnected || isMinting || isConfirming}
            style={{
              ...styles.button,
              fontSize: '1.2rem',
              padding: '0.9rem 0',
              borderRadius: '14px',
              margin: '0 auto',
              maxWidth: '100%',
              width: '95%',
              background: 'linear-gradient(90deg, #00c6fb 0%, #005bea 100%)',
              color: '#fff',
              boxShadow: '0 0 16px 0 #00c6fb80',
              letterSpacing: '0.04em',
              ...((!isConnected || isMinting || isConfirming) ? styles.buttonDisabled : {}),
            }}
          >
            {isMinting && 'Waiting for confirmation...'}
            {isConfirming && 'Minting...'}
            {!isMinting && !isConfirming && 'Mint NFT'}
          </button>
        </div>

        {/* Mensagens de erro/sucesso */}
        {error && <p style={styles.warning}>⚠️ {error}</p>}
        {successMessage && <p style={styles.success}>✅ {successMessage}</p>}

        {/* Detalhes integrados: Collection, Chain, Address, Price, Wallet, The soul spins at */}
        <div style={{ ...styles.contractInfo, marginTop: '0.0rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontWeight: 600 }}>Collection</span>
            <span style={{ color: '#00e6ff', fontWeight: 600, textShadow: '0 0 4px #000' }}>Mfer-bk-0-base</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontWeight: 600 }}>Chain</span>
            <span style={{ color: '#00e6ff', fontWeight: 600, textShadow: '0 0 4px #000' }}>Base</span>
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
            <span style={{ color: '#00e6ff', fontWeight: 600, textShadow: '0 0 4px #000' }}>This base is where that smile comes home.</span>
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
    maxWidth: '500px',
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
