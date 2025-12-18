


"use client";
import MintComponent from "@/components/MintComponent";
import styles from "./page.module.css";


export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <h1>The eyes. And the smile!</h1>
        <p>Mint pure <strong><em>Kinmutable</em></strong> lore!</p>
      </div>

      <div className={styles.promo}>
        <p style={{ transform: 'translateY(-12px)', margin: 0 }}> * The eyes see the flatline at 9 o-clock.</p>
        <p style={{ transform: 'translateY(12px)', margin: 0 }}> * The mouse bends it into a smile.!</p>
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
