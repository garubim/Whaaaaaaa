# Guia de Deploy - MferBk0Base Contract

## 📋 Resumo do Contrato

**Nome**: Mfer-bk-0'-base  
**Símbolo**: MFERB0B  
**Tipo**: ERC-721 com suporte a Enumerable  
**Supply Máx**: 1000 NFTs  
**Preço Testnet**: 0.0001 ETH  
**Preço Mainnet**: 0.0003 ETH  
**Metadata**: IPFS (Pinata)

---

## 🚀 Como Fazer Deploy

### Opção 1: Usando Remix IDE (Recomendado para rápido)

1. Acesse: https://remix.ethereum.org
2. Crie novo arquivo: `MferBk0Base.sol`
3. Cole o código do contrato
4. No painel esquerdo, clique em "Solidity Compiler"
5. Selecione versão `0.8.20` ou superior
6. Clique em "Compile MferBk0Base.sol"
7. Vá para "Deploy & Run Transactions"
8. Selecione:
   - Environment: "Injected Provider" (MetaMask/Coinbase Wallet)
   - Network: Base Sepolia (testnet) ou Base (mainnet)
9. Clique em "Deploy"
10. Confirme a transação no wallet

### Opção 2: Usando Hardhat/Foundry (Mais robusto)

```bash
# Instale dependências
npm install --save-dev hardhat @openzeppelin/contracts

# Configure hardhat.config.js para Base network
# Deploy via script

npx hardhat run scripts/deploy.js --network base
```

### Opção 3: Usando Blockscout/BaseScan Interface

1. Acesse: https://basescan.org (mainnet) ou https://sepolia.basescan.org (testnet)
2. Vá em "Contract Verification"
3. Faça upload do código compilado

---

## 📝 Variáveis de Ambiente a Configurar ANTES de Deploy

### Preço de Mint (IMPORTANTE!)

**Testnet**: `0.0001 ETH` (valor padrão no contrato)  
**Mainnet**: Mudar para `0.0003 ETH` antes de publicar!

Para alterar após deploy:
```solidity
contract.setMintPrice(ethers.parseEther("0.0003"))
```

### IPFS URI

**Padrão**: `ipfs://bafybeictdcmr2izorjgi54nybhradymq4l2q7a53nreh3kkt3xkp6j2qya/`

Se precisar alterar:
```solidity
contract.setBaseURI("ipfs://your-new-cid/")
```

---

## ✅ Verificações Após Deploy

1. **Registrar contrato no Basescan**:
   - Vá em Basescan
   - Procure seu endereço de contrato
   - Clique "Verify and Publish"
   - Cole o código e configurações

2. **Testar mint**:
   ```bash
   # Via ethers.js ou web3.js
   contract.mint({ value: ethers.parseEther("0.0001") })
   ```

3. **Validar metadata**:
   - Acesse: `ipfs://[CID]/1.json` (deve carregar metadata do token 1)
   - Confirme que o título é "Mfer 1"

---

## 🔗 Integração com OnchainKit

Depois que o contrato estiver deployed:

1. Pegue o endereço do contrato (ex: `0x1234...`)
2. Atualize em `app/page.tsx`:

```tsx
<NFTMintCard
  contractAddress="0xSEU_ENDERECO_AQUI"
  tokenId="1"  // Para ERC-721, tokenId é apenas referência
>
  {/* subcomponentes */}
</NFTMintCard>
```

---

## 🛠️ Funções Disponíveis

### Para Usuários
- `mint()` - Mintar um NFT pagando `MINT_PRICE`
- `tokenURI(tokenId)` - Obter metadata de um token
- `balanceOf(address)` - Ver saldo de NFTs

### Para Owner
- `ownerMint(address, quantity)` - Mintar múltiplos (giveaways)
- `setMintPrice(newPrice)` - Alterar preço
- `setMintingEnabled(bool)` - Ativar/desativar mint
- `setBaseURI(string)` - Alterar URI base
- `withdraw()` - Sacar fundos

---

## ⚠️ Checklist Antes do Mainnet

- [ ] Testar contrato em Base Sepolia (testnet)
- [ ] Confirmar preço em 0.0003 ETH
- [ ] Validar metadata IPFS está acessível
- [ ] Testar mint via app web
- [ ] Verificar contrato no Basescan
- [ ] Testar integração com OnchainKit
- [ ] Testar wallet (MetaMask, Coinbase Wallet, etc)

---

## 📞 Suporte Rápido

**Erro "Insufficient payment"**: Enviar valor menor que o esperado
**Erro "Max supply reached"**: 1000 NFTs já foram mintados
**Metadata não carrega**: Verificar IPFS/Pinata link

---

**Contrato pronto para ir ao ar!** 🎉
