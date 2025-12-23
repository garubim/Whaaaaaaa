const hre = require('hardhat');

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS;
  const RELAYER = process.env.RELAYER_ADDRESS;
  if (!contractAddress || !RELAYER) {
    console.error('Please set CONTRACT_ADDRESS and RELAYER_ADDRESS in .env');
    process.exit(1);
  }

  const Mfer = await hre.ethers.getContractFactory('MferMint');
  const mfer = Mfer.attach(contractAddress);

  const tx = await mfer.setRelayer(RELAYER);
  console.log('setRelayer tx:', tx.hash);
  await tx.wait();
  console.log('Relayer set to', RELAYER);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
