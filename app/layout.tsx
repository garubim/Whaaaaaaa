import type { Metadata } from "next";
import RootProvider from "./rootProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "The eyes. And the smile.",
  description: "Mint pure “Kinmutable” lore!",
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
