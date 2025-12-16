


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
        <h1>Whaaaaa! NFT Collection</h1>
        <p>Mint exclusive NFTs on Base network</p>
      </div>

      <div className={styles.promo}>
        <p> * The eyes see the flatline at 9 o-clock.</p>
        <p> * The mouse bends it into a smile.!</p>
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
