# Relayer template

This folder contains a minimal relayer template `relayer_template.js` that you can adapt to your Base Pay flow.

What it does
- Provides an Express webhook endpoint (`/webhook`) that expects a JSON payload containing `paymentId`, `artistContract`, `to`, `amount`, and optionally `token`.
- Verifies that the `Gallery` contract has received at least `amount` of `USDC` and then calls `Gallery.processPayment(artistContract, to, amount, paymentId)` with the configured `PRIVATE_KEY` signer.

Why this approach
- Base Pay / payment flows vary; some setups provide webhooks while others only provide client-side ids. A webhook-driven relayer is reliable and simple to verify server-side.
- The template also includes a `pollTransfersLookback()` helper to scan recent `Transfer` events for the configured `USDC` contract to the `Gallery` as a fallback.

Config (env vars)
- `RPC_URL` - JSON-RPC endpoint for Base (HTTP)
- `PRIVATE_KEY` - private key for the relayer signer (DO NOT COMMIT)
- `GALLERY_ADDRESS` - address of deployed `Gallery` contract
- `USDC_ADDRESS` - USDC token address used to detect payments
- `PORT` - optional HTTP port (default 3001)

Usage
1. Install deps: `npm install express ethers`
2. Start: `RPC_URL=... PRIVATE_KEY=... GALLERY_ADDRESS=... USDC_ADDRESS=... node scripts/relayer_template.js`
3. Post a webhook payload to `/webhook` with the fields described above.

Next steps / customizations
- If your frontend returns only a `paymentId`, add logic to map `paymentId` to an onchain transfer (Base Pay may provide a payment lookup endpoint).
- Add HMAC or signature verification for the webhook to secure it.
- Persist processed ids to a DB (SQLite / Redis) instead of a JSON file for production.
