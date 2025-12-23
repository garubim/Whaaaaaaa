const hardhat = require('hardhat');
const fs = require('fs');

async function main() {
  const USDC = process.env.USDC_ADDRESS;
  const PRICE_USDC = process.env.PRICE_USDC || '1500000';
  const ARTIST_ADDRESS = process.env.ARTIST_ADDRESS;
  const AGENT_ADDRESS = process.env.AGENT_ADDRESS || null;
  const FEE_BPS = process.env.FEE_BPS ? Number(process.env.FEE_BPS) : 500;
  const RELAYER_ADDRESS = process.env.RELAYER_ADDRESS || AGENT_ADDRESS || null;

  if (!USDC) {
    console.error('Please set USDC_ADDRESS in .env');
    process.exit(1);
  }

  const { ethers } = hardhat;

  const Mfer = await ethers.getContractFactory('MferMint');
  const mfer = await Mfer.deploy(USDC, PRICE_USDC);
  await mfer.deployed();
  console.log('MferMint deployed to:', mfer.address);

  if (ARTIST_ADDRESS && AGENT_ADDRESS) {
    try {
      const tx = await mfer.setPayees(ARTIST_ADDRESS, AGENT_ADDRESS);
      await tx.wait();
      console.log('Set payees on MferMint to:', ARTIST_ADDRESS, AGENT_ADDRESS);
    } catch (e) {
      console.warn('Failed to set payees on MferMint:', e);
    }
  }

  const Gallery = await ethers.getContractFactory('Gallery');
  const gallery = await Gallery.deploy(USDC);
  await gallery.deployed();
  console.log('Gallery deployed to:', gallery.address);

  try {
    const txg = await mfer.setGallery(gallery.address);
    await txg.wait();
    console.log('Set gallery on MferMint to:', gallery.address);
  } catch (e) {
    console.warn('Failed to set gallery on MferMint (you may set it later via owner):', e);
  }

  if (ARTIST_ADDRESS) {
    try {
      try {
        const txp = await mfer.setPayees(ARTIST_ADDRESS, AGENT_ADDRESS || ARTIST_ADDRESS);
        await txp.wait();
        console.log('Set payees on MferMint to:', ARTIST_ADDRESS, AGENT_ADDRESS || ARTIST_ADDRESS);
      } catch (e) {
        console.warn('Failed to set payees on MferMint:', e);
      }

      const tx = await mfer.transferOwnership(ARTIST_ADDRESS);
      await tx.wait();
      console.log('Transferred MferMint ownership to artist:', ARTIST_ADDRESS);
    } catch (e) {
      console.warn('Failed to transfer ownership to artist', e);
    }
  }

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
    MferMint: mfer.address,
    Gallery: gallery.address,
    Artist: ARTIST_ADDRESS || null,
    Agent: AGENT_ADDRESS || null,
    Relayer: RELAYER_ADDRESS || null,
    FeeBps: FEE_BPS,
  };
  fs.writeFileSync('deployed.json', JSON.stringify(out, null, 2));
  console.log('Wrote deployed.json');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
const hre = require('hardhat');

async function main() {
  const fs = require('fs');
  const USDC = process.env.USDC_ADDRESS;
  const PRICE_USDC = process.env.PRICE_USDC || '1500000'; // default 1.50 USDC (6 decimals)
  const ARTIST_ADDRESS = process.env.ARTIST_ADDRESS;
  const AGENT_ADDRESS = process.env.AGENT_ADDRESS || null;
  const FEE_BPS = process.env.FEE_BPS ? Number(process.env.FEE_BPS) : 500; // default 5%
  // prefer explicit RELAYER_ADDRESS, otherwise fall back to AGENT_ADDRESS so the agent can operate by default
  const RELAYER_ADDRESS = process.env.RELAYER_ADDRESS || AGENT_ADDRESS || null;

  if (!USDC) {
    console.error('Please set USDC_ADDRESS in .env');
    process.exit(1);
  }

  const Mfer = await hre.ethers.getContractFactory('MferMint');
  const mfer = await Mfer.deploy(USDC, PRICE_USDC);
  await mfer.deployed();

  console.log('MferMint deployed to:', mfer.address);

  // configure payees split if provided
  if (ARTIST_ADDRESS && AGENT_ADDRESS) {
    try {
      const tx = await mfer.setPayees(ARTIST_ADDRESS, AGENT_ADDRESS);
      await tx.wait();
      console.log('Set payees on MferMint to:', ARTIST_ADDRESS, AGENT_ADDRESS);
    } catch (e) {
      console.warn('Failed to set payees on MferMint:', e);
    }
  }

  // deploy Gallery contract (receives USDC via Base Pay, handles fee and forwards to artist)
  const Gallery = await hre.ethers.getContractFactory('Gallery');
  const gallery = await Gallery.deploy(USDC);
  await gallery.deployed();

  console.log('Gallery deployed to:', gallery.address);

  // link gallery in the artist contract so gallery can call mintFor
  try {
    const txg = await mfer.setGallery(gallery.address);
    await txg.wait();
    console.log('Set gallery on MferMint to:', gallery.address);
  } catch (e) {
    console.warn('Failed to set gallery on MferMint (you may set it later via owner):', e);
  }

  // Transfer ownership of MferMint to artist (if provided)
  if (ARTIST_ADDRESS) {
    try {
      // set payees first (split recipients)
      try {
        const txp = await mfer.setPayees(ARTIST_ADDRESS, AGENT_ADDRESS || ARTIST_ADDRESS);
        await txp.wait();
        console.log('Set payees on MferMint to:', ARTIST_ADDRESS, AGENT_ADDRESS || ARTIST_ADDRESS);
      } catch (e) {
        console.warn('Failed to set payees on MferMint:', e);
      }

      const tx = await mfer.transferOwnership(ARTIST_ADDRESS);
      await tx.wait();
      console.log('Transferred MferMint ownership to artist:', ARTIST_ADDRESS);
    } catch (e) {
      console.warn('Failed to transfer ownership to artist', e);
    }
  }

  // Configure gallery fee recipient and relayer if provided
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

  // write deployed addresses to file
  const out = {
    MferMint: mfer.address,
    Gallery: gallery.address,
    Artist: ARTIST_ADDRESS || null,
    Agent: AGENT_ADDRESS || null,
    Relayer: RELAYER_ADDRESS || null,
    FeeBps: FEE_BPS,
  };
  fs.writeFileSync('deployed.json', JSON.stringify(out, null, 2));
  console.log('Wrote deployed.json');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
