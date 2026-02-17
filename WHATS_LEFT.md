# What’s Left & Simplifications

## What’s left to finish

### 1. **Make the app runnable (critical)**

- **Tongo / Chipi Pay:** `@tongo/sdk` and `@chipi-pay/sdk` are not real npm packages (or have different APIs). The app will fail on `npm install` or at runtime.
  - **Done in this pass:** Replaced with **local mocks** in `lib/tongo.ts` and `lib/chipi-pay.ts` so the app runs and the demo works without real SDKs. Encryption is simulated (e.g. simple encode/decode) so judges can click through the full flow.

- **Starknet provider:** Wallet “Connect” can show no connectors if `connectors` are not passed to `StarknetConfig`.
  - **Done in this pass:** Provider updated to use `@starknet-react/chains` and `useInjectedConnectors` (e.g. Argent X, Braavos) so “Connect wallet” works on Sepolia.

### 2. **Contracts (optional for demo)** – wiring done

- **PayrollManager:** `execute_payroll` now iterates employees, updates `last_paid`, emits `SalaryPaid`. ABIs in `frontend/abi/`. Frontend calls add_employee, execute_payroll, set_payment_schedule when `NEXT_PUBLIC_PAYROLL_MANAGER_ADDRESS` is set.
- **ComplianceModule:** Frontend calls `grant_viewing_key` when `NEXT_PUBLIC_COMPLIANCE_MODULE_ADDRESS` is set. Deploy script: `scripts/deploy.ts` (run after `scarb build`).
- **Compile & deploy:** Run `scarb build` in `contracts/`. Then run deploy script or Starkli. Without deploy, the app runs with local state only.

### 3. **Nice to have (skip if you want to keep it simple)**

- **Contract addresses:** After deploying, put PayrollManager (and optionally ComplianceModule) addresses in `frontend/.env.local` so the frontend can call read/write. Without them, the app still runs with mocks.
- **One flow per role:** Company = one page (add employee → run payroll). Employee = one page (see balance → decrypt → “Spend” with Chipi). Reduces tabs and makes the story clearer for judges.

---

## Simplifications already applied (no over-engineering)

- **No backend:** Everything is client-side or on-chain; no server.
- **Demo-friendly:** Tongo/Chipi are mocks so the full flow works without API keys or real SDKs.
- **Single entry:** Homepage has two buttons: “Company” and “Employee”; judges pick one role.
- **Minimal deps:** Only Starknet React, starknet.js, and UI deps; Tongo/Chipi are local mocks.

---

## Checklist for “demo ready”

- [x] App installs (`npm install` in `frontend/`) and runs (`npm run dev`).
- [x] Connect Wallet shows connectors and connects (e.g. Argent X on Sepolia).
- [x] Company: add employee (with “encrypted” salary), run payroll (no real contract required with mocks).
- [x] Employee: generate keypair, “decrypt” salary, open Chipi Pay flow (mock).
- [ ] Optional: deploy contracts and add addresses to `.env.local` for real on-chain reads/writes.
- [x] Optional: short demo script below for judges.

You can stop here for a simple, judge-friendly demo. Add contract deployment and env only if you want the live chain in the demo.

---

## 5-step demo script for judges

1. **Home:** Open the app → click **Company Dashboard** or **Employee Portal**.
2. **Connect:** Click **Connect** and connect Argent X or Braavos (Sepolia).
3. **Company:** Add an employee (address, salary e.g. 5000, paste employee public key) → **Encrypt Salary** → **Add Employee**. Then **Execute Payroll**.
4. **Employee:** Open **Employee Portal** → **Key Management** → **Generate Keypair**. Copy public key (for step 3). Then **Your Salary** → **Decrypt Salary** to see amount (only you see it).
5. **Spend:** In Employee → **Spending Options** → try **Unwrap to USDC** or **QR Payment** (mock flow).
