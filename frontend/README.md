# Privacy Payroll Frontend

Next.js frontend application for the Privacy-First Payroll System.

## Features

- Company Dashboard: Manage employees, execute payroll, compliance
- Employee Portal: View salary, manage keys, spending options
- Wallet Integration: Argent X, Braavos support
- Privacy: Client-side encryption/decryption with Tongo SDK
- Payments: Chipi Pay integration for fiat off-ramp

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.local.example .env.local
# Edit .env.local with contract addresses
```

3. Run development server:
```bash
npm run dev
```

## Project Structure

- `app/`: Next.js App Router pages
- `components/`: React components
- `lib/`: Utility functions and SDK wrappers
- `hooks/`: Custom React hooks
- `store/`: Zustand state management
- `types/`: TypeScript type definitions

## Environment Variables

- `NEXT_PUBLIC_STARKNET_NETWORK`: Network (sepolia/mainnet)
- `NEXT_PUBLIC_STARKNET_RPC_URL`: RPC endpoint
- `NEXT_PUBLIC_PAYROLL_MANAGER_ADDRESS`: PayrollManager contract address
- `NEXT_PUBLIC_COMPLIANCE_MODULE_ADDRESS`: ComplianceModule contract address
- `NEXT_PUBLIC_USDC_TOKEN_ADDRESS`: USDC token address
- `NEXT_PUBLIC_TONGO_WRAPPER_ADDRESS`: Tongo wrapper contract address
