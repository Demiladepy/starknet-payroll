# Privacy-First Payroll System

A privacy-preserving payroll system built on Starknet using Tongo Protocol for encrypted salaries, account abstraction for batch payments, and Chipi Pay for fiat off-ramp.

## Architecture

- **Smart Contracts** (Cairo 2.x): PayrollManager, EmployeeAccount, ComplianceModule
- **Frontend** (Next.js): Company dashboard and employee portal
- **Privacy Layer**: Tongo SDK for ElGamal encryption
- **Payment Integration**: Chipi Pay SDK for fiat off-ramp

All processing happens client-side or on-chain - no backend server required.

## Features

- 🔐 **Private Salaries**: ElGamal encryption ensures salary amounts remain private on-chain
- 📦 **Batch Payments**: Execute payroll for all employees in a single transaction
- 💰 **Gasless UX**: Company pays gas fees for employees via paymaster
- 🔍 **Selective Disclosure**: Viewing keys enable compliance audits without exposing all data
- 💳 **Fiat Off-Ramp**: Chipi Pay integration for QR payments and bank transfers
- 🔑 **Session Keys**: Pre-authorize recurring payments without signing each time

## Project Structure

```
starknet/
├── contracts/              # Cairo smart contracts
│   ├── PayrollManager.cairo
│   ├── EmployeeAccount.cairo
│   ├── ComplianceModule.cairo
│   └── Scarb.toml
├── frontend/              # Next.js application
│   ├── app/              # Next.js App Router
│   ├── components/       # React components
│   ├── lib/              # Utilities
│   └── hooks/            # React hooks
├── scripts/              # Deployment scripts
└── README.md
```

## Setup

### Prerequisites

- Node.js 18+
- Starknet wallet (Argent X or Braavos) on Sepolia

### Quick start (demo without contracts)

1. Install and run the frontend:
```bash
cd frontend
npm install
npm run dev
```

2. Open [http://localhost:3000](http://localhost:3000), connect your wallet, and use **Company Dashboard** or **Employee Portal**. Encryption and Chipi Pay are mocked so the full flow works without deploying contracts.

### Optional: Smart contracts

1. Install Scarb and build:
```bash
cd contracts
scarb build
```

2. Deploy (set env vars: `PRIVATE_KEY`, `ACCOUNT_ADDRESS`, etc.) then put contract addresses in `frontend/.env.local`.

### Real Tongo & Chipi SDKs

The app uses **real SDKs** when configured; otherwise it falls back to mocks so the demo runs without keys.

**Tongo (confidential balances & transfers)**  
- Official Quick Start: [@fatsolutions/tongo-sdk](https://www.npmjs.com/package/@fatsolutions/tongo-sdk)  
- Set in `frontend/.env.local`:
  - `NEXT_PUBLIC_TONGO_CONTRACT_ADDRESS` – Tongo contract (e.g. mainnet USDC `0x0415f2c3b16cc43856a0434ed151888a5797b6a22492ea6fd41c62dbb4df4e6c`)
  - Optional for balance in browser: `NEXT_PUBLIC_STARKNET_SIGNER_ADDRESS`, `NEXT_PUBLIC_STARKNET_SIGNER_PRIVATE_KEY` (Starknet account used to create TongoAccount)
- API matches the SDK: `TongoAccount(privateKey, tongoAddress, signer)`; `stateDeciphered()`; `fund({ amount })` + `populateApprove()` + `signer.execute([fundOp.approve!, fundOp.toCalldata()])`; `transfer({ to: recipientPublicKey, amount })`; `rollover()`; `withdraw({ to, amount })`. Use `tongoService.createTongoAccount(tongoPrivateKey, { address, privateKey })` to get an account instance.
- Tongo SDK requires **starknet 8**. If you see version conflicts, use the mock flow or run Tongo ops in a script with `starknet@8`.

**Chipi Pay (gasless transfers, wallet creation)**  
- Get API key: [dashboard.chipipay.com](https://dashboard.chipipay.com)  
- Set in `frontend/.env.local`:
  - `NEXT_PUBLIC_CHIPI_API_KEY`
  - Optional for real transfers: `NEXT_PUBLIC_CHIPI_BEARER_TOKEN`, `NEXT_PUBLIC_CHIPI_WALLET_PUBLIC_KEY`, `NEXT_PUBLIC_CHIPI_WALLET_ENCRYPTED_KEY` (from Chipi wallet creation flow)
- Employee **Spending Options → Chipi Transfer** uses `useTransfer` when the API key is set and the app is wrapped with Chipi’s provider.

## Usage

### Company Dashboard

1. Connect your Starknet wallet
2. Navigate to Company Dashboard
3. Add employees with encrypted salaries
4. Execute batch payroll payments
5. Manage compliance viewing keys

### Employee Portal

1. Connect your Starknet wallet
2. Navigate to Employee Portal
3. Generate ElGamal keypair (first time only)
4. View encrypted balance and decrypt salary
5. Set up session keys for automated payments
6. Unwrap to public USDC or use Chipi Pay for spending

## Smart Contracts

### PayrollManager

Core payroll logic:
- `add_employee`: Add employee with encrypted salary
- `execute_payroll`: Batch payment execution
- `update_salary`: Modify employee salary
- `remove_employee`: Deactivate employee

### EmployeeAccount

Account abstraction contract:
- `claim_salary`: Employee-initiated salary claim
- `add_session_key`: Pre-authorize recurring payments
- `__validate__`: Returns paymaster for gasless transactions

### ComplianceModule

Viewing key management:
- `grant_viewing_key`: Allow auditor to decrypt specific salaries
- `revoke_viewing_key`: Remove auditor access

## Security Considerations

1. **Private Key Protection**: Employee private keys stored in browser localStorage (encrypted in production)
2. **Encryption Verification**: Always verify ZK proofs before accepting encrypted amounts
3. **Access Control**: Strict owner checks in PayrollManager contract
4. **Reentrancy**: Reentrancy guards on token transfer functions
5. **Input Validation**: Validate all user inputs before encryption/contract calls

## Development

### Testing

```bash
# Test contracts
cd contracts
scarb test

# Test frontend
cd frontend
npm test
```

### Building

```bash
# Build contracts
cd contracts
scarb build

# Build frontend
cd frontend
npm run build
```

## Deployment

### Contracts

Deploy to Starknet Sepolia testnet:
```bash
cd scripts
NETWORK=sepolia \
PRIVATE_KEY=your_key \
ACCOUNT_ADDRESS=your_address \
npm run deploy
```

### Frontend

Deploy to Vercel:
```bash
cd frontend
vercel deploy
```

## License

MIT

## Acknowledgments

- Built for Starknet Redefine Hackathon 2025
- Uses Tongo Protocol for privacy
- Integrates with Chipi Pay for fiat off-ramp
