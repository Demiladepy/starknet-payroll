# Live vs Mock Integration

## What is live today

| Feature | Status | Notes |
|--------|--------|--------|
| **StarkNet wallet (Connect wallet)** | Live | Uses ArgentX/Braavos via `@starknet-react/core`. Real RPC (Sepolia). |
| **Tongo transfer from modal** | Live when configured | If `VITE_TONGO_CONTRACT_ADDRESS` is set, company Tongo key + employee Tongo key are set, and user has connected the **injected wallet** (not Demo, not StarkZap sign-in), clicking "Confirm Transfer" builds real Tongo calldata and calls `account.execute()`. |
| **StarkZap SDK** | Live network, demo identity | SDK talks to StarkNet/Sepolia. "Sign in with Starkzap" uses a **random in-memory signer** (new key each time), so it’s not the user’s real wallet. |
| **Env / RPC** | Live | `VITE_STARKNET_RPC_URL`, `VITE_TONGO_CONTRACT_ADDRESS`, `VITE_PAYROLL_MANAGER_ADDRESS` are read from env. |

## What is mocked

| Feature | Status | Notes |
|--------|--------|--------|
| **Demo mode** | Mock | Mock wallet address/balances, seeded employees and transfers. No on-chain calls. |
| **StarkZap “Sign in”** | Demo identity | Creates a random key; no real wallet connection. |
| **StarkZap Swap (StarkZap page)** | Mock | Only updates local Zustand balances. No swap contract call. |
| **Tongo Deposit/Withdraw (Tongo page)** | Mock | Simulated delay + local note state. No Tongo contract deposit/withdraw. |
| **Transfer history tx hash** | Live for Tongo | When a Tongo transfer is executed on-chain, the app now uses the real `transaction_hash` from `execute()`. Other transfers (direct/StarkZap from modal) still use a mock hash because no on-chain call is made. |
| **Employees & transfers data** | Local only | Zustand + persist. No backend API, no on-chain payroll contract. |
| **Payroll manager contract** | Not used | Address is in env but the dashboard never calls it. |

---

## How to add / improve live integration

### 1. Use real transaction hash for transfers — DONE

When the app calls `account.execute()` or `starkzapWallet.execute()` for a **Tongo** transfer, it now uses the returned `transaction_hash` when adding the transfer to the store (see `confirmTransfer()` in `app/routes/dashboard.tsx`). For “direct” or “StarkZap” transfers from the modal, no on-chain execution happens yet, so they still use a mock hash until you add a real payment flow.

### 2. StarkZap: use the user’s real wallet

If the StarkZap SDK supports connecting an existing StarkNet account (e.g. from `useAccount()`), use that instead of `StarkSigner(randomPrivateKey())`. Then “Sign in with Starkzap” would use the same wallet as “Connect wallet” (or a StarkZap-specific flow that returns a real account). Check the `starkzap` package docs for wallet connection APIs.

### 3. StarkZap Swap: call a real swap contract

- Add a swap contract (or use an existing StarkNet DEX) and get its ABI and address.
- In `StarkZapSwapView`, instead of only updating local state, build and send a transaction (e.g. via `account.execute()` or StarkZap wallet) and use the returned `transaction_hash` for the swap entry in history.

### 4. Tongo: real deposit and withdraw on the Tongo page

- Use `@fatsolutions/tongo-sdk` (or the contract ABI) to build:
  - **Deposit**: call the Tongo contract to deposit and obtain a note (or note hash).
  - **Withdraw**: submit the note (and recipient) to the contract to withdraw.
- Replace the current `setTimeout` + local note generation with these contract calls and use the real tx hashes in history.

### 5. Employees and payroll from chain or backend

- **Option A – Backend API**: Add a small API (e.g. Node/Express or your existing backend) with CRUD for employees and (optionally) transfer records. The dashboard would `fetch()` from this API instead of (or in addition to) Zustand. Sync key actions (e.g. “Add employee”, “Record transfer”) to the API.
- **Option B – Payroll contract**: If the payroll manager contract stores employee list and/or payment records on-chain, add calls (read + write) using `starknet.js` or your existing StarkNet provider. Then the dashboard would load employees and possibly transfers from the contract and submit payroll/transfers via the contract.

### 6. Env and deployment

- Ensure production `.env` has:
  - `VITE_STARKNET_NETWORK` and `VITE_STARKNET_RPC_URL` for the target network.
  - `VITE_TONGO_CONTRACT_ADDRESS` (and wrapper if needed) for real Tongo.
  - `VITE_PAYROLL_MANAGER_ADDRESS` when you integrate the payroll contract.
- Keep Demo Mode so users can try the app without a wallet; hide or gate live features behind “Connect wallet” when needed.

---

## Summary

- **Live**: Injected StarkNet wallet, RPC, and (when configured and using injected wallet) Tongo transfer execution from the transfer modal.
- **Mock or local**: Demo mode, StarkZap identity and swap, Tongo deposit/withdraw on the Tongo page, transfer history tx hashes, and all employee/transfer data (no backend/contract for that yet).

The first step to “more live” is to **use the real transaction hash** from `execute()` when recording transfers; then add real StarkZap identity, real swap, real Tongo deposit/withdraw, and finally backend or payroll contract for employees and history.
