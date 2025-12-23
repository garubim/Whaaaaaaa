# Testes Sepolia — Mint do Mini App

Resumo rápido
- Objetivo: testar o fluxo de mint do mini app usando Base (Base Sepolia para testes) sem mexer no Mainnet.
- Modo opt-in: ative `NEXT_PUBLIC_ALLOW_SEPOLIA=true` localmente para usar o botão Base Pay e o modo de teste que introduzimos.

Passos mínimos (rápido)
1. Ative a variável de ambiente no seu `.env.local` (na raiz do repo):

```bash
NEXT_PUBLIC_ALLOW_SEPOLIA=true
# opcionalmente expor um RPC Sepolia e Base Sepolia se você tiver um
NEXT_PUBLIC_SEPOLIA_RPC=https://sepolia.infura.io/v3/YYY
NEXT_PUBLIC_BASE_SEPOLIA_RPC=https://your-base-sepolia-rpc
```

2. Obter Sepolia L1 ETH (faucet)
- Use o Faucet Paradigm: https://faucet.paradigm.xyz/ (selecionar Sepolia). Se estiver sem sucesso, tente outros faucets pesquisando "Sepolia faucet".

3. Levar ETH para Base Sepolia
- Use o bridge oficial: https://bridge.base.org/ e selecione Sepolia → Base Sepolia.
- Depois de transferir, confirme que sua carteira está na Base Sepolia (chain id da L2 de teste).

4. Rodar localmente

```bash
npm install
cp .env.example .env.local   # se houver exemplo
# adicione NEXT_PUBLIC_ALLOW_SEPOLIA=true no .env.local
npm run dev
```

5. Testar o mint
- Abra o app local, conecte a carteira (MetaMask ou Coinbase Wallet). Se a carteira estiver em Sepolia L1, use a bridge para Base Sepolia e então conecte na rede L2.
- Com `NEXT_PUBLIC_ALLOW_SEPOLIA=true` o botão de mint usa o `BasePayButton` (integração stub defensiva). Se você tiver o SDK `@base-org/account` instalado e a carteira suportar, o fluxo abrirá a UI de pagamento do Base.

Como adicionar sua carteira smart (`0x26dCd83d4e449059ABf0334e4435d48e74f28EB0`) como admin/minter no contrato
- Contrato alvo: `0x86a34dFaB59996C6fB809D1F2B016a0eD397E682` (conforme código no repo).
- Se o contrato expos uma função administrativa, por exemplo `addMinter(address)` ou `setAdmin(address)`, você pode chamar essa função com `wagmi`/`viem` no front-end sem precisar de chave do explorer.

Exemplo `writeContract` com `wagmi` (snippet):

```ts
await writeContract({
  address: '0x86a34dFaB59996C6fB809D1F2B016a0eD397E682',
  abi: [ { type: 'function', name: 'addMinter', inputs: [{ name: 'who', type: 'address' }], stateMutability: 'nonpayable' } ],
  functionName: 'addMinter',
  args: ['0x26dCd83d4e449059ABf0334e4435d48e74f28EB0'],
});
```

Se não souber o nome da função, peça ao time que escreveu o contrato ou inspecione o ABI do contrato no explorer (BaseScan) e me diga a função exata; eu gero o botão na UI.

Notas sobre Base Pay e configuração
- Na implementação atual eu adicionei um componente `BasePayButton` que tenta importar dinamicamente `@base-org/account`. Isso evita aumentar o bundle quando você não está testando Sepolia.
- Para um teste completo com Base Pay, instale `@base-org/account` (se necessário):

```bash
npm install @base-org/account
```

- O botão atual é um stub defensivo — dependendo da versão do SDK a assinatura pode variar; eu posso adaptar o payload ao SDK real quando você me confirmar a versão do package.

ChainId e correções rápidas
- Base mainnet chainId é `8453` — correto.
- Sepolia L1 é uma testnet L1; para usar Base Sepolia (L2) faça bridge a partir de Sepolia L1.

Faucets/links úteis
- Sepolia faucet (Paradigm): https://faucet.paradigm.xyz/
- Base bridge: https://bridge.base.org/
- Base docs: https://docs.base.org/

Sobre Zora / Creator Coin e API
- Se uma integração exige chave premium da Zora/Etherscan para aceitar chamadas na Base, isso geralmente é por políticas comerciais da ferramenta (cobrança por uso de API para L2). Infelizmente é comum algumas plataformas cobrarem por chaves avançadas.
- Alternativas gratuitas: use `wagmi`/`viem` para assinar e enviar txs diretamente do front-end com a carteira do usuário (sem precisar de chave externa). Posso gerar exemplos e botões para isso.

Se quiser que eu gere:
- `SEPOLIA_TESTING.md` (feito) — este arquivo.
- Um botão no front-end para chamar a função administrativa do contrato (ex.: `addMinter`) — eu posso criar e commitar agora.
- Integração completa com `@base-org/account` end-to-end — requer confirmar versão do SDK e possivelmente instalar o package.

---
Atualizei também um pequeno arquivo de configuração no repo para centralizar endereços admin.
