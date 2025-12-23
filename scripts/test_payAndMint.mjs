import fs from 'fs';
import { ethers } from 'ethers';

const envBackup = fs.readFileSync('.env.local.bak2','utf8');
const envLocal = fs.existsSync('.env.local') ? fs.readFileSync('.env.local','utf8') : '';
const find = (s, k) => { const m = s.match(new RegExp('^'+k+'=(.*)$','m')); return m?m[1].trim().replace(/^"|"$/g,''):null };
const PK = find(envBackup,'PRIVATE_KEY');
const RPC = find(envLocal,'RPC_URL') || find(envBackup,'RPC_URL') || process.env.RPC_URL || 'https://base-mainnet.publicnode.com';
const ARTIST = find(envLocal,'ARTIST_ADDRESS') || find(envBackup,'ARTIST_ADDRESS') || process.env.ARTIST_ADDRESS;
if(!PK){ console.error('PRIVATE_KEY not found in .env.local.bak2'); process.exit(1); }

const provider = new ethers.JsonRpcProvider(RPC);
const wallet = new ethers.Wallet(PK, provider);

(async()=>{
  try{
    const gallery = JSON.parse(fs.readFileSync('gallery.deployed.json','utf8')).Gallery;
    const mfer = JSON.parse(fs.readFileSync('mfer.deployed.json','utf8')).MferMint;
    const galleryAbi = JSON.parse(fs.readFileSync('artifacts/contracts/Gallery.sol/Gallery.json','utf8')).abi;
    const galleryC = new ethers.Contract(gallery, galleryAbi, wallet);
    const MINT_PRICE = BigInt(300000000000000); // 0.0003 ETH
    const paymentId = 'test-'+Date.now();
    console.log('from', await wallet.getAddress());
    console.log('gallery', gallery);
    console.log('mfer', mfer);
    console.log('artist', ARTIST);
    console.log('paymentId', paymentId);

    const tx = await galleryC.payAndMint(mfer, ARTIST, paymentId, { value: MINT_PRICE });
    console.log('tx.hash', tx.hash);
    const rc = await tx.wait();
    console.log('tx mined block', rc.blockNumber, 'status', rc.status);

    const mferAbi = JSON.parse(fs.readFileSync('artifacts/contracts/MferMint.sol/MferMint.json','utf8')).abi;
    const mferC = new ethers.Contract(mfer, mferAbi, provider);
    const events = await mferC.queryFilter(mferC.filters.MintedFor(), rc.blockNumber, rc.blockNumber);
    console.log('MintedFor events in block:', events.map(e=>({to:e.args.to, tokenId: e.args.tokenId?.toString(), paymentId: e.args.paymentId})));
  }catch(e){
    console.error('error', e);
    process.exit(1);
  }
})();
