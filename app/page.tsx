


"use client";

import MintComponent from "@/components/MintComponent";
import styles from "./page.module.css";
import { useEffect } from "react";
import { sdk } from "@farcaster/miniapp-sdk";



export default function Home() {
  useEffect(() => {
    (async () => {
      await sdk.actions.ready();
    })();
  }, []);

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <h1>The eyes! And the smile!</h1>
        <p style={{ fontSize: '1.56em', marginTop: '40px' }}>Mint pure <i>Kinmutable</i> lore!</p>
      </div>

      <div className={styles.promo}>
        <p style={{ marginBottom: '10px' }}> * The eyes see the flatline at 9 o-clock.</p>
        <p style={{ marginTop: '10px' }}> * The mouse bends it into a smile.!</p>
      </div>

      <MintComponent />

      <div className={styles.footer}>
        <a href="https://onchainkit.com" target="_blank" rel="noopener noreferrer">
          Powered by OnchainKit
        </a>
      </div>
    </main>
  );
}
