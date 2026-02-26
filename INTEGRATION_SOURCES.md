# Integration sources – where to get keys & docs

Use these sites and env vars to finish integrating Chipi, AVNU, Clerk, Tongo, and tooling.

---

## Chipi Pay

| What | Where |
|------|--------|
| **API keys** (public + secret) | **Dashboard:** https://dashboard.chipipay.com → create app, copy `NEXT_PUBLIC_CHIPI_API_KEY` (pk_dev_... / pk_prod_...) and `CHIPI_SECRET_KEY` (sk_dev_... / sk_prod_...). |
| **Docs** | Chipi dashboard and docs linked from dashboard. |

**Env (in `frontend/.env.local`):**
- `NEXT_PUBLIC_CHIPI_API_KEY=pk_dev_...` or `pk_prod_...`
- `CHIPI_SECRET_KEY=sk_dev_...` or `sk_prod_...`

---

## AVNU (swaps)

| What | Where |
|------|--------|
| **SDK** | **npm:** `npm install @avnu/avnu-sdk` — https://www.npmjs.com/package/@avnu/avnu-sdk |
| **Docs / first swap** | **Docs:** https://docs.avnu.fi — https://docs.avnu.fi/get-started/first-swap |
| **API key** (if needed) | **App:** https://app.avnu.fi or developer section in docs. |

**Usage (see `frontend/lib/avnu.ts` for token addresses):**
```ts
import { getQuotes, executeSwap } from '@avnu/avnu-sdk';
import { parseUnits } from 'ethers';

const quotes = await getQuotes({
  sellTokenAddress: ethAddress,
  buyTokenAddress: strkAddress,
  sellAmount: parseUnits('0.001', 18),
  takerAddress: account.address,
  size: 3,
});
const result = await executeSwap({
  provider: account,
  quote: quotes[0],
  slippage: 0.001,
});
```

---

## Clerk (auth)

| What | Where |
|------|--------|
| **Keys** | **Dashboard:** https://dashboard.clerk.com → create application, copy Publishable Key and Secret Key. |
| **Install** | `npm install @clerk/nextjs` — https://www.npmjs.com/package/@clerk/nextjs |
| **Next.js setup** | https://clerk.com/docs/quickstarts/nextjs |

**Env (in `frontend/.env.local`):**
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...` or `pk_live_...`
- `CLERK_SECRET_KEY=sk_test_...` or `sk_live_...`

**App:** Root layout uses `ClerkProvider`; `AuthHeader` shows Sign In / Sign Up / `UserButton` when Clerk keys are set. Middleware: `frontend/middleware.ts` (Clerk matcher).

---

## Tongo

| What | Where |
|------|--------|
| **Contract addresses** | Sepolia: `0x00b4cca30f0f641e01140c1c388f55641f1c3fe5515484e622b6cb91d8cee585` (STRK). Mainnet USDC: `0x0415f2c3b16cc43856a0434ed151888a5797b6a22492ea6fd41c62dbb4df4e6c`. |
| **SDK** | **npm:** https://www.npmjs.com/package/@fatsolutions/tongo-sdk |
| **Reference** | **Repo:** https://github.com/omarespejel/starknet-privacy-toolkit — **Tutorial:** https://espejel.bearblog.dev/starknet-privacy-toolkit/ |

**Env:** `NEXT_PUBLIC_TONGO_CONTRACT_ADDRESS=0x...` (and optional signer for decryption).

---

## Garaga (ZK proofs)

| What | Where |
|------|--------|
| **Install** | `npm i garaga` — https://www.npmjs.com/package/garaga |
| **Usage** | See `REFERENCE.md` and https://github.com/omarespejel/starknet-privacy-toolkit |

---

## Noir (circuits)

| What | Where |
|------|--------|
| **Install** | **Noir:** https://noirup.org — `noirup --version 1.0.0-beta.1` |
| **Mirrors** | https://github.com/noir-lang/noirup (if noirup.dev fails) |
| **Toolkit** | https://github.com/omarespejel/starknet-privacy-toolkit — setup scripts and versions |

---

## Starknet RPC / deploy

| What | Where |
|------|--------|
| **RPC (Starknet 8 for Tongo)** | **Alchemy:** https://dashboard.alchemy.com — Starknet app, v0.8 URL. **Blastapi:** https://blastapi.io |
| **Faucet / docs** | **Starknet:** https://docs.starknet.io |
| **Scarb (Cairo)** | https://docs.swmansion.com/scarb/ |

---

## Quick links

- **Chipi dashboard:** https://dashboard.chipipay.com  
- **Clerk dashboard:** https://dashboard.clerk.com  
- **AVNU docs:** https://docs.avnu.fi  
- **Tongo SDK:** https://www.npmjs.com/package/@fatsolutions/tongo-sdk  
- **Starknet Privacy Toolkit:** https://github.com/omarespejel/starknet-privacy-toolkit  
- **Noir:** https://noirup.org  
- **Garaga:** https://www.npmjs.com/package/garaga  
