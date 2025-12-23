/*
  Relayer template (webhook + simple polling fallback)

  Purpose:
  - Provide an easy-to-adapt Node script that receives a webhook from a
    payment frontend (Base Pay) with a `paymentId`, `artistContract`,
    `to` and `amount` and verifies the USDC was received by Gallery,
    then calls `Gallery.processPayment(artistContract, to, amount, paymentId)`.

  - Includes a simple polling mode (scan Transfer events) as an alternative
    if you can't configure webhooks.

  CONFIG (env vars):
  - RPC_URL            : JSON-RPC HTTP endpoint (Base / testnet)
  - PRIVATE_KEY        : deployer/relayer private key (used to call processPayment)
  - GALLERY_ADDRESS    : deployed Gallery contract address
  - USDC_ADDRESS       : USDC token address (ERC-20) used to watch incoming transfers
  - PORT               : (optional) HTTP port for webhook (default 3001)

  NOTE: This is a template. Adapt the webhook verification to match the
  payload your frontend / Base Pay sends. Keep secrets out of git.
*/

const express = require('express');
const fs = require('fs');
const { ethers } = require('ethers');

const RPC_URL = process.env.RPC_URL || '';
const PRIVATE_KEY = process.env.PRIVATE_KEY || '';
const GALLERY_ADDRESS = process.env.GALLERY_ADDRESS || '';
const USDC_ADDRESS = process.env.USDC_ADDRESS || '';
const PORT = process.env.PORT || 3001;

if (!RPC_URL || !PRIVATE_KEY || !GALLERY_ADDRESS || !USDC_ADDRESS) {
  console.warn('One or more required env vars missing: RPC_URL, PRIVATE_KEY, GALLERY_ADDRESS, USDC_ADDRESS');
}

const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
const signer = new ethers.Wallet(PRIVATE_KEY, provider);

// Minimal ABI for Gallery.processPayment
const GALLERY_ABI = [
  'function processPayment(address artistContract, address to, uint256 amount, string calldata paymentId) external',
];

// Minimal ERC20 ABI to check balances and Transfer events
const ERC20_ABI = [
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'function balanceOf(address) view returns (uint256)',
];

const gallery = new ethers.Contract(GALLERY_ADDRESS, GALLERY_ABI, signer);
const usdc = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, provider);

// Simple persistent store for processed paymentIds
const STORE_FILE = './relayer_processed.json';
let processed = { ids: [] };
try {
  if (fs.existsSync(STORE_FILE)) processed = JSON.parse(fs.readFileSync(STORE_FILE));
} catch (e) {
  processed = { ids: [] };
}

function markProcessed(paymentId) {
  if (!paymentId) return;
  processed.ids.push(paymentId);
  try {
    fs.writeFileSync(STORE_FILE, JSON.stringify(processed, null, 2));
  } catch (e) {}
}

function isProcessed(paymentId) {
  if (!paymentId) return false;
  return processed.ids.includes(paymentId);
}

const app = express();
app.use(express.json());

// Webhook endpoint expected payload (example):
// { paymentId, artistContract, to, amount, token: USDC_ADDRESS }
app.post('/webhook', async (req, res) => {
  try {
    const { paymentId, artistContract, to, amount, token } = req.body;
    if (!paymentId || !artistContract || !to || !amount) {
      return res.status(400).json({ error: 'missing fields' });
    }

    if (isProcessed(paymentId)) {
      return res.status(200).json({ ok: 'already processed' });
    }

    // Basic verification: check USDC balance of gallery is >= amount
    const balance = await usdc.balanceOf(GALLERY_ADDRESS);
    const amountBn = ethers.BigNumber.from(String(amount));
    if (balance.lt(amountBn)) {
      // Not yet present — client may retry or we can poll for it.
      return res.status(400).json({ error: 'insufficient balance on gallery' });
    }

    // Call processPayment on Gallery
    const tx = await gallery.processPayment(artistContract, to, amountBn, paymentId);
    const receipt = await tx.wait();
    markProcessed(paymentId);
    return res.json({ ok: true, txHash: receipt.transactionHash });
  } catch (e) {
    console.error('webhook error', e);
    return res.status(500).json({ error: String(e) });
  }
});

app.listen(PORT, () => {
  console.log(`Relayer webhook listening on http://localhost:${PORT}`);
});

// Simple polling helper (optional) - scan recent Transfer events to Gallery
async function pollTransfersLookback(lookbackBlocks = 1000) {
  if (!provider) return;
  try {
    const head = await provider.getBlockNumber();
    const fromBlock = Math.max(0, head - lookbackBlocks);
    console.log(`Scanning Transfer events to ${GALLERY_ADDRESS} from ${fromBlock}..${head}`);
    const filter = usdc.filters.Transfer(null, GALLERY_ADDRESS);
    const events = await usdc.queryFilter(filter, fromBlock, head);
    for (const ev of events) {
      const from = ev.args.from;
      const value = ev.args.value;
      console.log('Found transfer from', from, 'value', value.toString(), 'tx', ev.transactionHash);
      // You may want to map these transfers to paymentIds (if included offchain)
      // or trigger further verification here.
    }
  } catch (e) {
    console.warn('poll error', e);
  }
}

module.exports = { pollTransfersLookback };
