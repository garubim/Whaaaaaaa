import fs from 'fs';
import path from 'path';

const src = path.resolve('scripts/verification/MferMint.flattened.sol');
const dest = path.resolve('scripts/verification/MferMint.cleaned.sol');

if (!fs.existsSync(src)) {
  console.error('Source flattened not found:', src);
  process.exit(1);
}

const raw = fs.readFileSync(src, 'utf8');
const lines = raw.split(/\r?\n/);

let out = [];
let sawSpdx = false;
let sawPragma = false;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (!sawSpdx && /^\s*\/\/\s*SPDX-License-Identifier:/.test(line)) {
    out.push(line);
    sawSpdx = true;
    continue;
  }
  if (!sawPragma && /^\s*pragma\s+solidity/.test(line)) {
    out.push(line);
    sawPragma = true;
    out.push('');
    continue;
  }

  // skip import lines and duplicate pragma/SPDX
  if (/^\s*import\s+/.test(line)) continue;
  if (/^\s*\/\/\s*SPDX-License-Identifier:/.test(line)) continue;
  if (/^\s*pragma\s+solidity/.test(line)) continue;

  out.push(line);
}

fs.writeFileSync(dest, out.join('\n'), 'utf8');
console.log('Wrote cleaned file:', dest);
