Deploy rápido (Hardhat) — passos curtos

1) Instale dependências (se ainda não):
```
npm install --save-dev hardhat @nomiclabs/hardhat-ethers ethers dotenv
npm install @openzeppelin/contracts
```

2) Copie `.env.example` para `.env` e preencha `RPC_URL`, `PRIVATE_KEY`, `USDC_ADDRESS`, `PRICE_USDC`.

3) Compilar:
```
npx hardhat compile
```

4) Deploy (rede local ou a RPC configurada):
```
npx hardhat run scripts/deploy.js --network local
```

Saída: endereço do contrato — copie para `.env` em `CONTRACT_ADDRESS`.

5) Definir relayer (executar após deploy):
```
npx hardhat run scripts/setRelayer.js --network local
```

Observação: altere `--network` para sua rede (ex: base mainnet) se configurado.
