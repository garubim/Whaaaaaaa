"use client";

import { useState, useRef } from 'react';
import { APP_SCALE } from '../config/baseConfig';

const MFER_IMAGE_CID = 'bafybeiaevaflz35fjr4qhrrcaejbxqiie5v3itvgqmabtstwbpfe7vlodq';
const PINATA_GATEWAY = 'https://orange-eager-slug-339.mypinata.cloud/ipfs';

interface NFTImageProps {
  metadata?: {
    name: string;
    description: string;
    image?: string;
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
  const containerRef = useRef<HTMLDivElement | null>(null);
  const imageUrl = metadata?.image || `${PINATA_GATEWAY}/${MFER_IMAGE_CID}`;

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <p>{error}</p>
      </div>
    );
  }

  const handleFullscreen = async () => {
    try {
      if (!containerRef.current) return;
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await containerRef.current.requestFullscreen();
      }
    } catch (e) {
      console.warn('Fullscreen failed', e);
    }
  };

  const openFullRes = () => {
    window.open(imageUrl, '_blank');
  };

  return (
    <div ref={containerRef} style={styles.container}>
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
            <div style={styles.controlOverlay}>
              <button onClick={handleFullscreen} style={styles.videoButton} title="Fullscreen">⛶</button>
              <button onClick={openFullRes} style={styles.videoButton} title="Open full resolution">Open Full‑Res</button>
            </div>
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

const S = typeof APP_SCALE === 'number' ? APP_SCALE : 1;

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center' as const,
    position: 'relative' as const,
    gap: `${0.75 * S}rem`,
    padding: `${1.25 * S}rem`,
    background: 'rgba(255,255,255,0.10)',
    borderRadius: `${20 * S}px`,
    maxWidth: `${680 * S}px`,
    minWidth: `${640 * S}px`,
    margin: '0 auto',
  },
  controlOverlay: {
    position: 'absolute' as const,
    right: `${1 * S}rem`,
    top: `${1 * S}rem`,
    display: 'flex' as const,
    gap: `${0.5 * S}rem`,
    zIndex: 40,
    background: 'rgba(0,0,0,0.25)',
    padding: `${0.35 * S}rem`,
    borderRadius: `${8 * S}px`,
  },
  image: {
    width: '100%',
    maxWidth: `${640 * S}px`,
    minWidth: `${640 * S}px`,
    minHeight: `${640 * S}px`,
    aspectRatio: '1',
    borderRadius: `${16 * S}px`,
    marginBottom: `${0.75 * S}rem`,
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
    fontSize: `${1.25 * S}rem`,
    textAlign: 'center' as const,
    fontWeight: 700 as const,
  },
  description: {
    margin: `${0.25 * S}rem 0 0`,
    textAlign: 'center' as const,
    opacity: 0.95,
  },
  videoButtons: {
    display: 'flex' as const,
    gap: `${0.5 * S}rem`,
    justifyContent: 'center',
    marginTop: `${0.75 * S}rem`,
  },
  videoButton: {
    padding: `${0.45 * S}rem ${0.75 * S}rem`,
    borderRadius: `${8 * S}px`,
    border: 'none',
    background: 'rgba(255,255,255,0.08)',
    color: 'white',
    cursor: 'pointer' as const,
    fontSize: `${0.85 * S}rem`,
  },
  attributes: {
    display: 'grid' as const,
    gap: `${0.5 * S}rem`,
    marginTop: `${1 * S}rem`,
    width: '100%',
  },
  attribute: {
    display: 'flex' as const,
    justifyContent: 'space-between',
    background: 'rgba(0,0,0,0.13)',
    borderRadius: `${6 * S}px`,
    padding: `${0.4 * S}rem ${0.7 * S}rem`,
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
