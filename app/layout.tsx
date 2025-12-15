import type { Metadata } from "next";
import RootProvider from "./rootProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Whaaa?! Mfer-0'-base - NFT Mint on Base",
  description: "Mint exclusive Kin's NFTs on Base network",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
