# Real mode checklist (no mocks)

This repo runs in **demo mode** by default (local state + simulated unwrap/QR/off-ramp). To run the **real mode** end-to-end, you need:

## 1) Tooling

- Node 18+
- A Starknet wallet (Argent X / Braavos) for the browser UI
- A funded Starknet account for deploying (Sepolia recommended)
- Cairo toolchain + Scarb (to compile contracts)

## 2) Deploy contracts (PayrollManager + ComplianceModule + demo EmployeeAccount)

1. Compile:
   - `cd contracts && scarb build`
2. Deploy and write `frontend/.env.local`:
   - Set:
     - `NETWORK=sepolia`
     - `RPC_URL=...` (optional)
     - `ACCOUNT_ADDRESS=0x...`
     - `PRIVATE_KEY=0x...`
     - `USDC_TOKEN_ADDRESS=0x...` (optional, can be 0x0 for demo)
     - `TONGO_WRAPPER_ADDRESS=0x...` (optional, can be 0x0 for demo)
   - Run:
     - `node scripts/deploy.ts`

This writes:
- `NEXT_PUBLIC_PAYROLL_MANAGER_ADDRESS`
- `NEXT_PUBLIC_COMPLIANCE_MODULE_ADDRESS`
- `NEXT_PUBLIC_EMPLOYEE_ACCOUNT_ADDRESS` (a single demo instance used by the UI)

## 3) Real Tongo (confidential USDC)

- **RPC:** Must support **Starknet 8** (`specVersion: "0.8"`). Use an RPC URL that supports v0.8 (e.g. Alchemy mainnet v0_8). The app uses this only when loading the Tongo SDK (dynamic import).
- **Optional:** For a Node/script environment, `starknet@8.x.x` is recommended; the frontend keeps `starknet@6` for Starknet React and loads the SDK separately.

Add to `frontend/.env.local`:

- `NEXT_PUBLIC_TONGO_CONTRACT_ADDRESS=0x...` (e.g. mainnet USDC: `0x0415f2c3b16cc43856a0434ed151888a5797b6a22492ea6fd41c62dbb4df4e6c`)

If you want the app to decrypt state without passing a signer explicitly, also set:
- `NEXT_PUBLIC_STARKNET_SIGNER_ADDRESS=0x...`
- `NEXT_PUBLIC_STARKNET_SIGNER_PRIVATE_KEY=0x...`

**To do real “unwrap”** in the UI:
- you need a **Tongo private key** (ElGamal scalar) for the employee, and
- a **Starknet signer** (Account) that can execute transactions (approve/transfer/withdraw).

Today the UI shows the exact requirements, but `UnwrapFlow` is still simulated.

## 4) Real Chipi Pay

Add to `frontend/.env.local` (from Chipi dashboard):
- `NEXT_PUBLIC_CHIPI_API_KEY=...`
- (Optional) `NEXT_PUBLIC_AVNU_API_KEY=...`

To do real transfers via the `useTransfer` hook:
- `NEXT_PUBLIC_CHIPI_BEARER_TOKEN=...`
- `NEXT_PUBLIC_CHIPI_WALLET_PUBLIC_KEY=...`
- `NEXT_PUBLIC_CHIPI_WALLET_ENCRYPTED_KEY=...`

## 5) Run the frontend

- `cd frontend`
- `npm install`
- `npm run dev`

