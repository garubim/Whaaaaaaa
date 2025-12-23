import fs from 'fs';
import path from 'path';

const src = path.resolve('scripts/verification/solc-standard-json-input.json');
const dest = path.resolve('scripts/verification/solc-standard-input-only.json');

if (!fs.existsSync(src)) {
  console.error('Source not found:', src);
  process.exit(1);
}

const raw = fs.readFileSync(src, 'utf8');
let parsed;
try {
  parsed = JSON.parse(raw);
} catch (err) {
  console.error('Failed to parse JSON:', err.message);
  process.exit(1);
}

const input = parsed.input ?? null;
if (!input) {
  console.error('`input` field not found in source JSON. Writing empty object to destination.');
  fs.writeFileSync(dest, JSON.stringify({}, null, 2), 'utf8');
  console.log('Wrote empty object to', dest);
  process.exit(0);
}

fs.writeFileSync(dest, JSON.stringify(input, null, 2), 'utf8');
console.log('Wrote:', dest);
