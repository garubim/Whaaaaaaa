'use client';

import { useState, useEffect } from 'react';

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

  useEffect(() => {
    const preloadImage = () => {
      const img = new Image();
      img.onload = () => setIsLoading(false);
      img.onerror = () => {
        setError('Failed to load image');
        setIsLoading(false);
      };
      img.src = imageUrl;
    };

    preloadImage();
  }, [imageUrl]);

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {isLoading && (
        <div style={styles.spinner}>
          <div style={styles.spinnerInner}></div>
        </div>
      )}
      <img
        src={imageUrl}
        alt="NFT Artwork"
        style={{
          ...styles.image,
          opacity: isLoading ? 0 : 1,
          transition: 'opacity 0.3s ease-in-out',
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

      <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    gap: '1.5rem',
    padding: '1rem',
    borderRadius: '12px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  },
  image: {
    width: '100%',
    height: 'auto',
    borderRadius: '8px',
    aspectRatio: '1',
    objectFit: 'cover' as const,
  },
  spinner: {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  },
  spinnerInner: {
    width: '40px',
    height: '40px',
    border: '4px solid rgba(255, 255, 255, 0.2)',
    borderTopColor: 'white',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
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
  },
  attribute: {
    display: 'flex' as const,
    justifyContent: 'space-between' as const,
    padding: '0.5rem',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '4px',
    fontSize: '0.85rem',
  },
  traitType: {
    fontWeight: 'bold' as const,
    opacity: 0.8,
  },
  traitValue: {
    color: '#00ffff',
    fontWeight: '600' as const,
  },
  errorContainer: {
    padding: '2rem',
    backgroundColor: 'rgba(255, 100, 100, 0.2)',
    borderRadius: '8px',
    color: '#ff6464',
    textAlign: 'center' as const,
  },
};
