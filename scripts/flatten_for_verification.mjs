import fs from 'fs';
import path from 'path';

const buildInfoPath = path.resolve('artifacts/build-info');
const files = fs.readdirSync(buildInfoPath).filter(f => f.endsWith('.json'));
if (files.length === 0) {
  console.error('No build-info files found in artifacts/build-info');
  process.exit(1);
}
// pick the first build-info (should be the solc-0_8_20 one)
const infoFile = files.find(f => f.includes('0_8_20')) || files[0];
const info = JSON.parse(fs.readFileSync(path.join(buildInfoPath, infoFile),'utf8'));
const sources = info.input.sources; // object map

function makeFlattened(mainSourcePath) {
  if (!sources[mainSourcePath]) {
    console.error('Main source not found in build-info:', mainSourcePath);
    return;
  }
  // Start with SPDX and pragma from main file
  const mainContent = sources[mainSourcePath].content;
  const pragmaMatch = mainContent.match(/pragma solidity[^;]+;/);
  const spdxMatch = mainContent.match(/SPDX-License-Identifier:\s*([^\n\r]+)/);
  const header = [];
  if (spdxMatch) header.push(`// SPDX-License-Identifier: ${spdxMatch[1].trim()}`);
  if (pragmaMatch) header.push(pragmaMatch[0]);

  let out = header.join('\n') + '\n\n';

  // Append main contract without its SPDX/pragma
  let mainNoHeader = mainContent.replace(/\/\*\*?\/[\s\S]*?\*\//g, match => match) // keep comments
    .replace(/\/\/.*$/gm, '') // remove single-line comments to avoid duplicate SPDX? keep simple
  ;
  // Remove pragma and SPDX lines from main
  mainNoHeader = mainNoHeader.replace(/pragma solidity[^;]+;/, '');
  mainNoHeader = mainNoHeader.replace(/SPDX-License-Identifier:[^\n\r]*/g, '');

  out += `// ===== File: ${mainSourcePath} =====\n`;
  out += mainNoHeader + '\n\n';

  // Append all other sources from build-info
  for (const [p, obj] of Object.entries(sources)) {
    if (p === mainSourcePath) continue;
    out += `// ===== File: ${p} =====\n`;
    let content = obj.content;
    // strip pragma and SPDX to avoid duplicates
    content = content.replace(/pragma solidity[^;]+;/, '');
    content = content.replace(/SPDX-License-Identifier:[^\n\r]*/g, '');
    out += content + '\n\n';
  }

  return out;
}

const galleryPath = 'project/contracts/Gallery.sol';
const mferPath = 'project/contracts/MferMint.sol';

const outDir = path.resolve('scripts/verification');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const galleryFlatten = makeFlattened(galleryPath);
const mferFlatten = makeFlattened(mferPath);

if (galleryFlatten) fs.writeFileSync(path.join(outDir,'Gallery.flattened.sol'), galleryFlatten);
if (mferFlatten) fs.writeFileSync(path.join(outDir,'MferMint.flattened.sol'), mferFlatten);

console.log('Wrote:');
if (galleryFlatten) console.log(' -', path.join('scripts/verification','Gallery.flattened.sol'));
if (mferFlatten) console.log(' -', path.join('scripts/verification','MferMint.flattened.sol'));
console.log('\nCompiler details from build-info:');
console.log(' - solcVersion:', info.solcVersion || info.solcLongVersion);
console.log(' - optimizer enabled:', info.input.settings.optimizer.enabled);
console.log(' - optimizer runs:', info.input.settings.optimizer.runs);
console.log(' - evmVersion:', info.input.settings.evmVersion || 'default');
console.log('\nNow run the encoder script to get constructor args hex.');
