#!/usr/bin/env node
const hre = require('hardhat');
const fs = require('fs');

async function main() {
  const USDC = process.env.USDC_ADDRESS;
  const PRICE_USDC = process.env.PRICE_USDC || '1500000';
  const ARTIST_ADDRESS = process.env.ARTIST_ADDRESS || null;
  const AGENT_ADDRESS = process.env.AGENT_ADDRESS || null;
  const FEE_BPS = process.env.FEE_BPS ? Number(process.env.FEE_BPS) : 500;
  const RELAYER_ADDRESS = process.env.RELAYER_ADDRESS || AGENT_ADDRESS || null;

  if (!USDC) {
    console.error('Please set USDC_ADDRESS in .env or environment');
    process.exit(1);
  }

  const { ethers } = hre;

  console.log('Deploying Gallery with USDC:', USDC);
  const Gallery = await ethers.getContractFactory('Gallery');
  const gallery = await Gallery.deploy(USDC);
  await gallery.deployed();
  console.log('Gallery deployed to:', gallery.address);

  // Configure fee recipient (agent) and relayer if provided
  if (AGENT_ADDRESS) {
    try {
      const tx = await gallery.setFee(AGENT_ADDRESS, FEE_BPS);
      await tx.wait();
      console.log(`Gallery fee set to ${FEE_BPS} bps for recipient:`, AGENT_ADDRESS);
    } catch (e) {
      console.warn('Failed to set gallery fee', e);
    }
  }

  if (RELAYER_ADDRESS) {
    try {
      const tx = await gallery.setRelayer(RELAYER_ADDRESS);
      await tx.wait();
      console.log('Gallery relayer set to:', RELAYER_ADDRESS);
    } catch (e) {
      console.warn('Failed to set gallery relayer', e);
    }
  }

  const out = {
    Gallery: gallery.address,
    Artist: ARTIST_ADDRESS || null,
    Agent: AGENT_ADDRESS || null,
    Relayer: RELAYER_ADDRESS || null,
    FeeBps: FEE_BPS,
  };
  fs.writeFileSync('gallery.deployed.json', JSON.stringify(out, null, 2));
  console.log('Wrote gallery.deployed.json');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
