README — Verificação Manual (BaseScan / Etherscan)

Resumo
- Este README descreve os passos para verificar manualmente os contratos implantados no Base (BaseScan/Etherscan) usando os arquivos flattened já gerados em `scripts/verification`.

Arquivos prontos
- `scripts/verification/Gallery.flattened.sol`
- `scripts/verification/MferMint.flattened.sol`
- `gallery.deployed.json` (contém o endereço de `Gallery`)
- `mfer.deployed.json` (contém o endereço de `MferMint`)
- Constructor args hex gerados em `node scripts/encode_constructor_args.mjs`

Endereços implantados
- Gallery: 0x4a4005306fB72AA234CD0A550d03E55DE889c5E7
- MferMint: 0xF1FDf1B1A15244fD59FD3aAD1D519194F5Fa54C6

Constructor args (sem 0x)
- Gallery: `000000000000000000000000833589fcd6edb6e08f4c7c32d4f71b54bda02913`
- MferMint: `000000000000000000000000833589fcd6edb6e08f4c7c32d4f71b54bda02913000000000000000000000000000000000000000000000000000000000016e360`

Configurações do compilador (use exatamente estas na tela de verificação)
- Compiler: `0.8.20`
- Optimization: `Enabled`
- Runs: `200`
- EVM Version: `shanghai` (se houver opção)
- License: `MIT` (o flattened inclui SPDX header)

Passos para verificação manual
1. Abra a página de verificação de contrato no BaseScan/Etherscan para o endereço alvo.
2. Selecione "Verify and Publish" → escolha "Single File" / "Flattened" (ou similar).
3. Faça upload do arquivo correspondente em `scripts/verification`:
   - Para `Gallery`: `Gallery.flattened.sol`
   - Para `MferMint`: `MferMint.flattened.sol`
4. Preencha as configurações do compilador como acima.
5. Cole o constructor args (hex) correspondentes (sem `0x`).
6. Submeta e aguarde o processamento. Se a verificação falhar, anote a mensagem de erro e siga a seção "Resolução de problemas" abaixo.

Devo rodar um "Decompile Bytecode" antes de verificar?
- Não é necessário rodar uma decompilação antes de tentar a verificação. A verificação usa o código-fonte para reproduzir exatamente o bytecode compilado — a decompilação não ajuda nesse processo.
- Quando a verificação falha por mismatch de bytecode, a decompilação pode ajudar a inspecionar diferenças, mas o caminho correto é comparar as configurações de compilador, remappings e args de construtor; verifique também se você está usando o mesmo `solc` (a build-info indica `0.8.20`) e as mesmas otimizações.
- Se quiser inspecionar o bytecode por curiosidade/diagnóstico, ferramentas úteis:
  - https://ethervm.io/decompile
  - https://github.com/ethereum/evm-decompiler (diversos projetos)
  - Etherscan has a built-in bytecode viewer in the contract page

Resolução de problemas comuns
- "Bytecode mismatch": confirme que
  - usou `0.8.20` com optimizer ON e runs=200;
  - usou exatamente o flattened gerado a partir do `artifacts/build-info` (este repo já gerou os flattened corretos);
  - preencheu os constructor args hex sem `0x` e em ordem correta;
  - não editou os arquivos Solidity entre compilação e verificação.
- "Imports not found" / erros de remapping: o flattened já incorpora os arquivos importados; use a opção "single file"/"flattened" (não o modo multi-file).
- Se a UI do scanner reclamar de metadata/metadata hash, compare o `metadata` do `artifacts/build-info/*` com o retornado on-chain (às vezes a plataforma exige upload do metadata JSON — se solicitado, posso extrair e instruir).

Comandos úteis localmente
- Regenerar flattened (se recompilar):
```bash
node scripts/flatten_for_verification.mjs
```
- Regenerar constructor args hex:
```bash
node scripts/encode_constructor_args.mjs
```

Se preferir, eu mesmo posso fazer o upload manual via uma sessão (se você der acesso ao navegador), ou posso preparar um pacote ZIP com os arquivos `Gallery.flattened.sol`, `MferMint.flattened.sol` e este README para você subir.


