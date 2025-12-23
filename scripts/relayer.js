const { ethers } = require('ethers');
require('dotenv').config();

// Simple relayer PoC:
// - listens for USDC Transfer events to the gallery contract
// - when a transfer >= PRICE_USDC is seen, calls gallery.processPayment(artistContract, buyer, amount, txHash)

const RPC = process.env.RPC_URL;
const RELAYER_KEY = process.env.RELAYER_PRIVATE_KEY;
const USDC_ADDRESS = process.env.USDC_ADDRESS;
const GALLERY_ADDRESS = process.env.GALLERY_ADDRESS;
const ARTIST_ADDRESS = process.env.ARTIST_ADDRESS;
const GALLERY_ADDRESS = process.env.GALLERY_ADDRESS || process.env.NEXT_PUBLIC_GALLERY_ADDRESS;
const PRICE_USDC = process.env.PRICE_USDC || '1500000'; // 1.5 USDC (6 decimals)

if (!RPC || !RELAYER_KEY || !USDC_ADDRESS || !GALLERY_ADDRESS || !ARTIST_ADDRESS) {
  console.error('Please set RPC_URL, RELAYER_PRIVATE_KEY, USDC_ADDRESS, GALLERY_ADDRESS, ARTIST_ADDRESS in .env');
  process.exit(1);
}

const provider = new ethers.providers.JsonRpcProvider(RPC);
const wallet = new ethers.Wallet(RELAYER_KEY, provider);

const usdcAbi = [
  'event Transfer(address indexed from, address indexed to, uint256 value)'
];

const galleryAbi = [
  'function processPayment(address artistContract, address to, uint256 amount, string calldata paymentId) external'
];

async function main() {
  const usdc = new ethers.Contract(USDC_ADDRESS, usdcAbi, provider);
  const gallery = new ethers.Contract(GALLERY_ADDRESS, galleryAbi, wallet);

  console.log('Relayer started, listening for USDC transfers to gallery:', GALLERY_ADDRESS);

  usdc.on('Transfer', async (from, to, value, event) => {
    try {
      if (to.toLowerCase() !== GALLERY_ADDRESS.toLowerCase()) return;
      const amount = value.toString();
      console.log('Detected incoming USDC', { from, to, amount, txHash: event.transactionHash });

      // basic threshold check
      if (BigInt(amount) < BigInt(PRICE_USDC)) {
        console.log('Amount below PRICE_USDC, ignoring');
        return;
      }

      // call gallery.processPayment(artistContract, buyer, amount, paymentId=txHash)
      const tx = await gallery.processPayment(ARTIST_ADDRESS, from, amount, event.transactionHash, { gasLimit: 500000 });
      console.log('processPayment tx submitted', tx.hash);
      await tx.wait();
      console.log('processPayment confirmed', tx.hash);
    } catch (e) {
      console.error('Error handling Transfer event', e);
    }
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
