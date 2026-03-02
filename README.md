# Privacy-First Payroll System

A privacy-preserving payroll app on Starknet with **Starkzap** and **Tongo**: company dashboard, employee management, and optional private (encrypted) transfers.

## Architecture

- **Frontend** (React Router 7 + Vite): Company dashboard and home; client-side only for wallet/Starknet
- **Wallet & sign-in**: **Connect wallet** (injected, e.g. Argent X / Braavos) and **Sign in with Starkzap** (Starkzap SDK, demo in-memory signer for hackathon)
- **Privacy (optional)**: Tongo SDK for confidential transfers when company/employee Tongo keys are set
- **Network**: Starknet Sepolia (configurable via env)

No backend server; processing is client-side or on-chain.

## Features

- **Dual connect**: “Connect wallet” (injected) and “Sign in with Starkzap” — both visible in the UI
- **Private transfers**: Optional Tongo path for encrypted salary amounts on-chain
- **Unified account**: Dashboard and transfers use either the Starkzap wallet or the injected wallet as the active account
- **Company dashboard**: Employees, transfer history, new transfer flow (Tongo when configured)
- **Theme, toasts, command palette**: Dark/light theme, notifications, Cmd+K palette

## Project structure

```
starknet-payroll/
├── new-frontend/                 # React Router 7 + Vite app
│   ├── app/
│   │   ├── components/           # UI and dashboard components
│   │   │   ├── dashboard/        # Topbar, Sidebar, Overview, etc.
│   │   │   └── ui/               # Button, Card, Modal, etc.
│   │   ├── contexts/             # React context
│   │   │   ├── StarkzapContext.tsx   # Starkzap SDK, connect/disconnect
│   │   │   ├── DashboardContext.tsx  # Employees, transfers state
│   │   │   ├── ToastContext.tsx
│   │   │   └── ThemeContext.tsx
│   │   ├── lib/                  # Utilities
│   │   │   ├── tongo.ts          # Tongo buildTransferCall, config
│   │   │   ├── employeeSchema.ts
│   │   │   ├── seed.ts
│   │   │   └── ...
│   │   ├── providers/
│   │   │   └── AppProviders.tsx  # QueryClient, Starknet, Starkzap
│   │   ├── routes/
│   │   │   ├── home.tsx
│   │   │   └── dashboard.tsx    # Layout, wallet section, content
│   │   ├── root.tsx
│   │   └── routes.ts
│   ├── .env.example
│   ├── package.json
│   └── README.md
└── README.md
```

## Setup

### Prerequisites

- Node.js 18+
- Starknet wallet (e.g. Argent X, Braavos) on Sepolia for “Connect wallet”
- (Optional) Tongo keys for private transfers

### Quick start

1. Install and run the frontend:

```bash
cd new-frontend
npm install
npm run dev
```

2. Open [http://localhost:5173](http://localhost:5173). Use **Connect wallet** or **Sign in with Starkzap** from the dashboard header.

### Environment

Copy `.env.example` to `.env` in `new-frontend/` and adjust:

| Variable | Description |
|----------|-------------|
| `VITE_STARKNET_NETWORK` | e.g. `sepolia` |
| `VITE_STARKNET_RPC_URL` | Starknet RPC URL |
| `VITE_PAYROLL_MANAGER_ADDRESS` | Payroll manager contract (if used) |
| `VITE_TONGO_CONTRACT_ADDRESS` | Tongo contract for private transfers |
| `VITE_TONGO_WRAPPER_ADDRESS` | Tongo wrapper address |
| `VITE_PRIVY_APP_ID` | Optional Privy app id |

### Tongo (optional private transfers)

- Set Tongo env vars in `new-frontend/.env`.
- In the dashboard: add/edit employees with a Tongo public key; enter the company Tongo private key in the transfer modal to enable the private (Tongo) path.
- When active account is injected wallet or Starkzap, the app uses `buildTransferCall` and executes via `account.execute` or `starkzapWallet.execute` respectively.

## Usage

### Company dashboard

1. Go to the dashboard (link from home).
2. **Connect**: Use **Connect wallet** (injected) or **Sign in with Starkzap**.
3. Add employees (name, role, department, salary, wallet address, optional Tongo public key).
4. **New Transfer**: Pick employee, amount, optional note. If Tongo is configured and keys are set, the transfer uses the private Tongo path; otherwise it’s recorded locally.
5. View **Transfer history** and manage employees from the same dashboard.

### Sign in with Starkzap

- **Sign in with Starkzap** creates a demo session with an in-memory signer (no key stored). Ideal for hackathon demos to show Starkzap integration.
- When connected via Starkzap, the UI shows a “Starkzap” badge and the wallet address; transfers use the Starkzap wallet when Tongo is used.

## Development

### Build

```bash
cd new-frontend
npm run build
```

### Deploy (frontend)

The app is a standard Vite + React Router build. Deploy the output of `npm run build` (e.g. `build/client` and `build/server` for SSR) to Vercel or any Node-friendly host. Ensure Starknet/Starkzap run only on the client (dashboard is already wrapped in a client-only guard for SSR).

## Hackathons

- **Starkzap-focused**: Lead with “Sign in with Starkzap” and show the badge + transfer flow.
- **Tongo / wallet-focused**: Lead with “Connect wallet” and optional Tongo private transfers.

Same codebase; two visible entry points (Connect wallet | Sign in with Starkzap) so both integrations are clear.

## License

MIT

## Acknowledgments

- Built for Starknet ecosystem hackathons
- Uses [Starkzap](https://www.npmjs.com/package/starkzap) for wallet/signer integration
- Optional privacy via Tongo Protocol
