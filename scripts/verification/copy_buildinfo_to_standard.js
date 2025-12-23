import fs from 'fs';
import path from 'path';

const src = path.resolve('artifacts/build-info/solc-0_8_20-a2d3640994a2d2a3614dad405c4692b997355105.output.json');
const destDir = path.resolve('scripts/verification');
const dest = path.join(destDir, 'solc-standard-json-input.json');

if (!fs.existsSync(src)) {
  console.error('Source build-info not found:', src);
  process.exit(1);
}
if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

const content = fs.readFileSync(src, 'utf8');
// The verifier expects the Standard-Json-Input (the `input` object). If you prefer the full output, we copy the full file.
// Many verifiers accept the full Hardhat build-info output as well. If you need strictly the `input` object,
// run: JSON.parse(content).input and write that.

fs.writeFileSync(dest, content, 'utf8');
console.log('Wrote:', dest);
