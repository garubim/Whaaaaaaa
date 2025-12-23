import fs from 'fs';
import path from 'path';
import { ethers } from 'ethers';

const galleryAddr = JSON.parse(fs.readFileSync('gallery.deployed.json','utf8')).Gallery;
const mferAddr = JSON.parse(fs.readFileSync('mfer.deployed.json','utf8')).MferMint;
const env = fs.existsSync('.env.local') ? fs.readFileSync('.env.local','utf8') : (fs.existsSync('.env.local.bak2')?fs.readFileSync('.env.local.bak2','utf8'):'');
const find = (k) => { const m = env.match(new RegExp('^'+k+'=(.*)$','m')); return m?m[1].trim().replace(/^"|"$/g,''):null };
const USDC = find('USDC_ADDRESS') || '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913';
const PRICE_USDC = find('PRICE_USDC') || '1500000';

function encodeGalleryCtor() {
  // Gallery(address _usdc)
  const abiTypes = ['address'];
  const values = [USDC];
  const encoded = ethers.AbiCoder.defaultAbiCoder().encode(abiTypes, values);
  return encoded.replace(/^0x/, '');
}

function encodeMferCtor() {
  // MferMint(address _usdc, uint256 _priceUSDC)
  const abiTypes = ['address','uint256'];
  const values = [USDC, PRICE_USDC];
  const encoded = ethers.AbiCoder.defaultAbiCoder().encode(abiTypes, values);
  return encoded.replace(/^0x/, '');
}

console.log('Gallery constructor args (hex):');
console.log(encodeGalleryCtor());
console.log('\nMferMint constructor args (hex):');
console.log(encodeMferCtor());
