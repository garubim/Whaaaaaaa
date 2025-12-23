import fs from 'fs';
import path from 'path';

const src = path.resolve('scripts/verification/solc-standard-json-input.json');
const destNoOpt = path.resolve('scripts/verification/solc-standard-json-input-noopt.json');
const destInputOnly = path.resolve('scripts/verification/solc-standard-input-only-noopt.json');

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

if (!parsed.input || !parsed.input.settings) {
  console.error('Input/settings not found in source JSON.');
  process.exit(1);
}

parsed.input.settings.optimizer = parsed.input.settings.optimizer || {};
parsed.input.settings.optimizer.enabled = false;

fs.writeFileSync(destNoOpt, JSON.stringify(parsed, null, 2), 'utf8');
console.log('Wrote:', destNoOpt);

fs.writeFileSync(destInputOnly, JSON.stringify(parsed.input, null, 2), 'utf8');
console.log('Wrote:', destInputOnly);
