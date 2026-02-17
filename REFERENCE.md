# Reference: Tongo, Starknet privacy & ZK

Quick pointers to SDK usage, deployed contracts, and related repos.

---

## Tongo SDK (@fatsolutions/tongo-sdk)

- **Install:** `npm i @fatsolutions/tongo-sdk` (and for real RPC: `starknet@8.x.x` with `specVersion: "0.8"`).
- **Usage:** `Account` (TongoAccount) = `new TongoAccount(privateKey, tongoAddress, signer)` where `signer` is a Starknet `Account` from `starknet` (RpcProvider with `specVersion: "0.8"`).
- **Operations:** `fund` → `signer.execute([fundOp.approve!, fundOp.toCalldata()])`; `transfer` / `rollover` / `withdraw` → `signer.execute([op.toCalldata()])`.
- **State:** `await account.stateDeciphered()` → `{ balance, pending, nonce }`.
- **Mainnet USDC Tongo (rate 1):** `0x0415f2c3b16cc43856a0434ed151888a5797b6a22492ea6fd41c62dbb4df4e6c`.

Some SDK variants accept optional `sender: "STARKNET_ADDRESS"` in `fund`, `transfer`, `rollover`, `withdraw`.

---

## Starknet Privacy Toolkit (Tongo + Noir/Garaga)

- **Repo:** [omarespejel/starknet-privacy-toolkit](https://github.com/omarespejel/starknet-privacy-toolkit)
- **What:** End-to-end Tongo private donation demo + Noir/Garaga verified donor badges.
- **Tutorial:** https://espejel.bearblog.dev/starknet-privacy-toolkit/
- **Deployed (from README):**
  - Mainnet Tongo: `0x026f79017c3c382148832c6ae50c22502e66f7a2f81ccbdb9e1377af31859d3a` (USDC)
  - Sepolia Tongo: `0x00b4cca30f0f641e01140c1c388f55641f1c3fe5515484e622b6cb91d8cee585` (STRK)
- **Relevant surface:** `src/tongo-client.ts`, `template/quickstart.ts`.

---

## Sumo Login (Cairo)

- **Repo:** [fatlabsxyz/sumo-login-cairo](https://github.com/fatlabsxyz/sumo-login-cairo)
- **What:** Social login for smart wallets using JWT zkProofs and account abstraction (Google, Discord, etc.; no seed phrases).
- **Contracts:** SUMO Account + SUMO Login (paymaster / deploy & login via JWT + ephemeral keys + ZK proof).

---

## Semaphore

- **Repo:** [semaphore-protocol/semaphore](https://github.com/semaphore-protocol/semaphore)
- **What:** Zero-knowledge protocol for anonymous interactions (prove membership, send messages/votes without revealing identity).
- **Site:** https://semaphore.pse.dev

---

## Garaga (Groth16 / MSM)

- **Install:** `npm i garaga`
- **Use:** WASM-based proof verification (e.g. Groth16 calldata for Cairo verifiers).

```ts
import { init, msmCalldataBuilder, getGroth16CallData, CurveId } from "garaga";

await init();

// Multi-scalar multiplication
const calldata = msmCalldataBuilder(points, scalars, CurveId.BN254);

// Groth16 proof verification calldata
const groth16Calldata = getGroth16CallData(proof, verifyingKey, CurveId.BN254);
```

The [starknet-privacy-toolkit](https://github.com/omarespejel/starknet-privacy-toolkit) uses Garaga + Noir for donation badge proofs and verifier contracts.
