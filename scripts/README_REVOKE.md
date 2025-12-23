## Revoke Approvals Script

Arquivo: `scripts/revokeApprovals.js`

Resumo
- Script Node (ESM) que envia `approve(spender, 0)` para um token ERC-20 utilizando `viem`.

Pré-requisitos
- Node.js (>=18 recomendado)
- Instalar dependências do projeto (`npm install`)
- Nunca commit suas chaves privadas em repositórios.

Uso
- Via variáveis de ambiente (recomendado):

```bash
PRIVATE_KEY=0x... RPC_URL=https://seu_rpc node scripts/revokeApprovals.js <tokenAddress> <spenderAddress>
```

- Ou passando RPC como terceiro argumento:

```bash
node scripts/revokeApprovals.js <tokenAddress> <spenderAddress> https://seu_rpc
```

Exemplo

```bash
PRIVATE_KEY=0xabc... RPC_URL=https://base-mainnet.yourprovider node scripts/revokeApprovals.js 0xUSDCtoken 0xGallerySpender
```

O que o script faz
- Constrói uma transação `approve(spender, 0)` e a envia usando a conta derivada de `PRIVATE_KEY`.
- Imprime o objeto da transação retornado pelo `viem` no console.

Segurança e recomendações
- Teste primeiro em uma conta de baixo valor (testnet ou carteira de staging).
- Não use a chave principal diretamente no chat ou em locais públicos.
- Verifique o `RPC_URL` e prefira provedores confiáveis.
- Após enviar, acompanhe a transação em um explorer ou via RPC `eth_getTransactionReceipt`.

Melhorias possíveis
- Adicionar modo `dry-run` para estimar gas sem enviar.
- Aceitar um arquivo CSV com pares `<token,spender>` e processar em lote.

Suporte
- Se quiser, eu posso gerar um `dry-run` ou adicionar processamento em lote automático.
