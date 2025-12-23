#!/usr/bin/env node
import { createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

// Usage:
// PRIVATE_KEY=0x... RPC_URL=https://... node scripts/revokeApprovals.js <tokenAddress> <spenderAddress>
// or
// node scripts/revokeApprovals.js <tokenAddress> <spenderAddress> <rpcUrl>

const [,, tokenAddress, spenderAddress, rpcArg] = process.argv;

if (!tokenAddress || !spenderAddress) {
  console.error('Usage: node scripts/revokeApprovals.js <tokenAddress> <spenderAddress> [rpcUrl]');
  process.exit(1);
}

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const RPC = rpcArg || process.env.RPC_URL || process.env.NEXT_PUBLIC_BASE_MAIN_RPC || process.env.NEXT_PUBLIC_BASE_RPC;

if (!PRIVATE_KEY) {
  console.error('Error: PRIVATE_KEY must be set in env (never commit your key).');
  process.exit(1);
}

if (!RPC) {
  console.error('Error: RPC URL not provided. Set RPC_URL env or pass as 3rd arg.');
  process.exit(1);
}

const erc20Abi = [
  {
    type: 'function',
    name: 'approve',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    stateMutability: 'nonpayable',
  },
];

async function main() {
  try {
    const account = privateKeyToAccount(PRIVATE_KEY);
    const client = createWalletClient({
      transport: http(RPC),
      account,
    });

    console.log(`Sending approve(${spenderAddress}, 0) for token ${tokenAddress}`);

    const tx = await client.writeContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: 'approve',
      args: [spenderAddress, 0n],
    });

    console.log('Transaction submitted:', tx);
    console.log('Use explorer or the tx hash above to follow status.');
  } catch (e) {
    console.error('Error sending revoke tx:', e);
    process.exit(1);
  }
}

main();
