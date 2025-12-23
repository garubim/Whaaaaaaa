import fs from 'fs';
import { ethers } from 'ethers';

const env = fs.existsSync('.env.local') ? fs.readFileSync('.env.local','utf8') : (fs.existsSync('.env.local.bak2')?fs.readFileSync('.env.local.bak2','utf8'):'');
const m = env.match(/^RPC_URL=(.*)$/m);
const RPC = (m && m[1].trim()) || process.env.RPC_URL || 'https://api.developer.coinbase.com/rpc/v1/base/QDv2XZtiPNHyVtbLUsY5QT7UTHM6Re2N';
const provider = new ethers.JsonRpcProvider(RPC);

function readArtifact(p){ return JSON.parse(fs.readFileSync(p,'utf8')); }

async function check(name, deployedFile, deployedJsonKey, artifactPath){
  const deployed = JSON.parse(fs.readFileSync(deployedFile,'utf8'));
  const addr = (deployed[deployedJsonKey] || deployedJsonKey);
  const art = readArtifact(artifactPath);
  const compiledBytecode = (art.evm && art.evm.deployedBytecode && (art.evm.deployedBytecode.object || art.evm.deployedBytecode)) || art.deployedBytecode || art.bytecode;
  const onchain = await provider.getCode(addr);
  const normCompiled = compiledBytecode.startsWith('0x')?compiledBytecode:('0x'+compiledBytecode);
  console.log(`\n[${name}] address: ${addr}`);
  console.log('compiled bytecode length:', normCompiled.length);
  console.log('onchain bytecode length:', onchain.length);
  if (onchain === normCompiled) {
    console.log('MATCH: on-chain bytecode exactly matches compiled deployedBytecode.');
  } else {
    // show hashes
    const hc = ethers.keccak256(normCompiled);
    const ho = ethers.keccak256(onchain);
    console.log('compiled keccak:', hc);
    console.log('onchain  keccak:', ho);
    console.log('NOTE: bytecode differs. This can be due to metadata differences or different compiler settings.');
  }
}

(async()=>{
  try{
    await check('Gallery','gallery.deployed.json','Gallery','artifacts/contracts/Gallery.sol/Gallery.json');
    await check('MferMint','mfer.deployed.json','MferMint','artifacts/contracts/MferMint.sol/MferMint.json');
  }catch(e){ console.error('error', e); process.exit(1);} })();
