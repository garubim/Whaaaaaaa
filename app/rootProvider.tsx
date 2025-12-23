'use client';

import { OnchainKitProvider } from '@coinbase/onchainkit';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { base, sepolia } from 'viem/chains';
import { createConfig, http } from 'wagmi';

const baseRpc = process.env.NEXT_PUBLIC_BASE_RPC || process.env.NEXT_PUBLIC_BASE_MAIN_RPC || '';
const sepoliaRpc = process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC || process.env.NEXT_PUBLIC_SEPOLIA_RPC || '';

const chains = sepoliaRpc ? ([base, sepolia] as const) : ([base] as const);

const transports: Record<number, any> = {};
if (baseRpc) transports[base.id] = http(baseRpc);
else transports[base.id] = http();
if (sepoliaRpc) transports[sepolia.id] = http(sepoliaRpc);

const config = createConfig({
  chains,
  transports,
});

const queryClient = new QueryClient();

export default function RootProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider
          apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
          chain={base}
          config={{
            wallet: { display: 'modal', preference: 'all' },
            appearance: { name: 'Whaaaaa', mode: 'auto', theme: 'default' },
          }}
        >
          {children}
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
