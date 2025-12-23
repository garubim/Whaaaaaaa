import fs from 'fs';
import path from 'path';

const src = path.resolve('scripts/verification/MferMint.flattened.sol');
const dest = path.resolve('scripts/verification/MferMint.cleaned.reordered.sol');

if (!fs.existsSync(src)) {
  console.error('Source flattened not found:', src);
  process.exit(1);
}

const raw = fs.readFileSync(src, 'utf8');

// Split into file sections using the marker lines
const parts = raw.split(/(?=^\/\/ ===== File: )/m);

const projectKey = 'project/contracts/MferMint.sol';
const projectParts = [];
const otherParts = [];

for (const part of parts) {
  const m = part.match(/^\/\/ ===== File: (.+?) =====/m);
  if (m) {
    const fname = m[1].trim();
    if (fname.includes(projectKey)) projectParts.push({fname, part});
    else otherParts.push({fname, part});
  } else {
    // keep header parts (SPDX/pragma) in others
    otherParts.push({fname: 'prelude', part});
  }
}

// Build output: keep prelude (first part if SPDX/pragma present), then all otherParts except prelude that are npm, then projectParts last
let out = '';

// ensure SPDX + first pragma are at top: find first occurrence
let spdx = null;
let pragma = null;
const remaining = [];

for (const p of otherParts) {
  if (!spdx && /SPDX-License-Identifier/.test(p.part)) {
    spdx = p.part.match(/.*SPDX-License-Identifier.*\n?/)[0];
    // remove that line from part
    p.part = p.part.replace(/.*SPDX-License-Identifier.*\n?/, '');
  }
  if (!pragma && /pragma\s+solidity/.test(p.part)) {
    const m = p.part.match(/pragma\s+solidity[^\n]*\n?/);
    if (m) {
      pragma = m[0];
      p.part = p.part.replace(m[0], '');
    }
  }
  remaining.push(p);
}

if (spdx) out += spdx;
if (pragma) out += pragma + '\n';

// append other parts (npm libs etc.)
for (const p of remaining) {
  out += '\n' + p.part.replace(/^\s+/, '');
}

// append project parts last
for (const p of projectParts) {
  out += '\n' + p.part.replace(/^\s+/, '');
}

// Remove any remaining import lines (single-file must not have import statements)
out = out.split(/\r?\n/).filter(l => !/^\s*import\s+/.test(l)).join('\n');

fs.writeFileSync(dest, out, 'utf8');
console.log('Wrote reordered cleaned file:', dest);
