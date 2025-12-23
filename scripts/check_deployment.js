const { ethers } = require('ethers');
const fs = require('fs');
require('dotenv').config();

async function main() {
  const rpc = process.env.RPC_URL;
  if (!rpc) {
    console.error('Please set RPC_URL in .env');
    process.exit(1);
  }

  const provider = new ethers.providers.JsonRpcProvider(rpc);

  if (!fs.existsSync('deployed.json')) {
    console.error('deployed.json not found. Run deploy first.');
    process.exit(1);
  }

  const deployed = JSON.parse(fs.readFileSync('deployed.json', 'utf8'));
  const { MferMint: mferAddr, Gallery: galleryAddr } = deployed;

  if (!mferAddr) {
    console.error('MferMint address not found in deployed.json');
    process.exit(1);
  }

  const mferAbi = [
    'function owner() view returns (address)',
    'function gallery() view returns (address)',
    'function name() view returns (string)'
  ];

  const galleryAbi = [
    'function feeRecipient() view returns (address)',
    'function feeBps() view returns (uint256)',
    'function relayer() view returns (address)'
  ];

  const mfer = new ethers.Contract(mferAddr, mferAbi, provider);
  console.log('MferMint:', mferAddr);
  try {
    const owner = await mfer.owner();
    const g = await mfer.gallery();
    const name = await mfer.name();
    console.log('  name:', name);
    console.log('  owner:', owner);
    console.log('  gallery:', g);
  } catch (e) {
    console.error('Failed to read MferMint:', e.message || e);
  }

  if (galleryAddr) {
    const gallery = new ethers.Contract(galleryAddr, galleryAbi, provider);
    console.log('Gallery:', galleryAddr);
    try {
      const feeRecipient = await gallery.feeRecipient();
      const feeBps = await gallery.feeBps();
      const relayer = await gallery.relayer();
      console.log('  feeRecipient:', feeRecipient);
      console.log('  feeBps:', feeBps.toString());
      console.log('  relayer:', relayer);
    } catch (e) {
      console.error('Failed to read Gallery:', e.message || e);
    }
  } else {
    console.log('No Gallery address in deployed.json — skip gallery checks');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
