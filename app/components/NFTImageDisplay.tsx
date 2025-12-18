'use client';

import { useState } from 'react';

const MFER_IMAGE_CID = 'bafybeiaevaflz35fjr4qhrrcaejbxqiie5v3itvgqmabtstwbpfe7vlodq';
const PINATA_GATEWAY = 'https://orange-eager-slug-339.mypinata.cloud/ipfs';

interface NFTImageProps {
  metadata?: {
    name: string;
    description: string;
    attributes?: Array<{
      trait_type: string;
      value: string;
    }>;
  };
  showAttributes?: boolean;
}

export default function NFTImageDisplay({ metadata, showAttributes = false }: NFTImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl] = useState(`${PINATA_GATEWAY}/${MFER_IMAGE_CID}`);

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <img
        src={imageUrl}
        alt={metadata?.name || 'NFT'}
        style={styles.image}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setError('Failed to load image');
          setIsLoading(false);
        }}
      />
      {metadata && (
        <div style={styles.metadata}>
          <h3 style={styles.title}>{metadata.name}</h3>
          <p style={styles.description} dangerouslySetInnerHTML={{ __html: metadata.description }}></p>
          <div style={styles.videoButtons}>
            <button
              onClick={() => window.open(imageUrl, '_blank')}
              style={styles.videoButton}
            >
              Open IPFS (new tab)
            </button>
            <button
              onClick={() => window.open(imageUrl, '_blank', 'width=1080,height=1080')}
              style={styles.videoButton}
            >
              Open 1080×1080 popup
            </button>
          </div>
          {showAttributes && metadata?.attributes && metadata.attributes.length > 0 && (
            <div style={styles.attributes}>
              {metadata.attributes.map((attr) => (
                <div key={attr.trait_type} style={styles.attribute}>
                  <span style={styles.traitType}>{attr.trait_type}</span>
                  <span style={styles.traitValue}>{attr.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center' as const,
    gap: '1.5rem',
    padding: '2.5rem',
    background: 'rgba(255,255,255,0.10)',
    borderRadius: '20px',
    maxWidth: '520px',
    minWidth: '340px',
    margin: '0 auto',
    boxShadow: '0 0 32px 0 #00c6fb30',
  },
  image: {
    width: '100%',
    maxWidth: '420px',
    minWidth: '320px',
    minHeight: '320px',
    aspectRatio: '1',
    borderRadius: '16px',
    marginBottom: '1.5rem',
    boxShadow: '0 0 32px 0 #00c6fb40',
    objectFit: 'cover' as const,
    background: '#222',
  },
  errorContainer: {
    padding: '2rem',
    color: 'red',
    textAlign: 'center' as const,
  },
  metadata: {
    color: 'white',
    textAlign: 'center' as const,
    display: 'flex' as const,
    flexDirection: 'column' as const,
    alignItems: 'center' as const,
  },
  title: {
    margin: 0,
    fontSize: '1.25rem',
    textAlign: 'center' as const,
    fontWeight: 700 as const,
  },
  description: {
    margin: '0.25rem 0 0',
    textAlign: 'center' as const,
    opacity: 0.95,
  },
  videoButtons: {
    display: 'flex' as const,
    gap: '0.5rem',
    justifyContent: 'center',
    marginTop: '0.75rem',
  },
  videoButton: {
    padding: '0.45rem 0.75rem',
    borderRadius: '8px',
    border: 'none',
    background: 'rgba(255,255,255,0.08)',
    color: 'white',
    cursor: 'pointer' as const,
    fontSize: '0.85rem',
  },
  attributes: {
    display: 'grid' as const,
    gap: '0.5rem',
    marginTop: '1rem',
    width: '100%',
  },
  attribute: {
    display: 'flex' as const,
    justifyContent: 'space-between',
    background: 'rgba(0,0,0,0.13)',
    borderRadius: '6px',
    padding: '0.4rem 0.7rem',
  },
  traitType: {
    fontWeight: 600,
    opacity: 0.8,
  },
  traitValue: {
    color: '#00ffff',
    fontWeight: 600,
  },
};
