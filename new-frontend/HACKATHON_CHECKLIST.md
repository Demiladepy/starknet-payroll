# Starknet Payroll Dashboard – Run-through & Hackathon Checklist

## 1. Do you need any external APIs?

**No third-party REST/API keys are required for core functionality.**

| Feature | External dependency | Required? |
|--------|----------------------|-----------|
| **Employee CRUD & transfers (local)** | None | Works with no env |
| **Starknet wallet connect** | Starknet RPC (public default) | Optional; defaults to Sepolia public RPC |
| **Tongo (private transfers)** | Tongo contract on Starknet + company/employee keys | Optional; app works without it |
| **Privy (auth)** | `VITE_PRIVY_APP_ID` | Optional; not used in current dashboard flow |

- **Without any env**: App runs with seed employees, local state, and simulated transfers (no chain).
- **With Starknet only**: Wallet connect and normal (public) transfers work; no Tongo.
- **With Tongo env**: Private balance/transfer path is enabled (see below).

---

## 2. Is Tongo configured properly?

Tongo is **optional**. The app is written so that:

- If `VITE_TONGO_CONTRACT_ADDRESS` is **not** set → Tongo is disabled; UI still works (no “Tongo” label, no private transfer path).
- If it **is** set → Tongo is “configured”; wallet section shows “Tongo”, and transfer flow can use private transfers when keys are present.

**To enable Tongo:**

1. **Create `.env`** (copy from `.env.example`).
2. **Set at least:**
   ```bash
   VITE_TONGO_CONTRACT_ADDRESS=0x00b4cca30f0f641e01140c1c388f55641f1c3fe5515484e622b6cb91d8cee585
   ```
   (That’s the Sepolia STRK example from `.env.example`; replace with your deployment if different.)
3. **Optional:**  
   `VITE_TONGO_WRAPPER_ADDRESS` – only if your integration uses a wrapper contract.  
   `VITE_STARKNET_NETWORK` / `VITE_STARKNET_RPC_URL` – override only if not using default Sepolia.

**Flow that uses Tongo:**

- User connects wallet (Starknet).
- In “New Transfer”, user can paste **company Tongo private key** (stored in localStorage for the session).
- Employee must have **Tongo public key** set (optional field in Add/Edit Employee).
- If both company key + employee Tongo key + amount are set, the app builds a Tongo transfer and executes it via `account.execute()`.

So: **Tongo is configured properly when** `VITE_TONGO_CONTRACT_ADDRESS` is set and the contract is deployed on the same network as your RPC. No external API keys are needed for Tongo itself.

---

## 3. App run-through (manual QA)

Use this to confirm nothing is broken.

### 3.1 Landing & navigation

- [ ] Open `/` (home). Title and “Open Dashboard” visible.
- [ ] Click “Open Dashboard” or “Dashboard” → `/dashboard`.
- [ ] Default view is **Overview** (stats, charts, recent transfers/hires).

### 3.2 Sidebar & views

- [ ] Sidebar: Overview, Employees, Transfers, Settings.
- [ ] Click **Employees** → employee table and “Add Employee” / “New Transfer”.
- [ ] Click **Transfers** → same content with transfer history.
- [ ] Click **Settings** → placeholder (no error).
- [ ] Collapse sidebar (if toggle exists) and expand again.

### 3.3 Command palette & shortcuts

- [ ] **Ctrl+K** (or Cmd+K) → command palette opens.
- [ ] “Go to Overview” → view switches to Overview.
- [ ] **Ctrl+N** (or Cmd+N) → Employees view + Add Employee sheet opens.
- [ ] **Ctrl+T** (or Cmd+T) → Transfers view + New Transfer modal opens.
- [ ] Escape closes palette/sheet/modal.

### 3.4 Employees

- [ ] **Add employee:** “Add Employee” → sheet from right. Fill: Name (2+ chars), Role, Department, Salary (≥ 0), Wallet (0x + 40–64 hex), Hire date. Submit → toast “Employee added.” and row appears.
- [ ] **Validation:** Submit with empty name or invalid wallet → inline error messages.
- [ ] **Edit:** Click pencil on a row → sheet opens with data; change and submit → “Employee updated.”
- [ ] **Delete:** Click trash → AlertDialog “Remove …? This cannot be undone.” → Confirm → employee removed, toast.
- [ ] **Search:** Type in search box → table filters by name/role/department.
- [ ] **Copy wallet:** Click copy next to wallet in table → icon changes; clipboard has full address.

### 3.5 Transfers

- [ ] **New Transfer** → modal. Select employee, amount, optional note.
- [ ] If Tongo not configured: no Tongo key field; “Next: Summary” → “Confirm Transfer” → transfer recorded and toast.
- [ ] If Tongo configured: optional company Tongo key field; if filled + employee has Tongo key, summary shows “Private transfer (Tongo)” and confirm executes on-chain.
- [ ] Transfer appears in “Transfer History” with date, recipient, amount, note, wallet (copy button).

### 3.6 Overview

- [ ] Stat cards: Total Employees, Active, Monthly Payroll, Total Transferred.
- [ ] Charts: payroll trend, department distribution.
- [ ] Recent transfers and recent hires lists.

### 3.7 Theme & UI

- [ ] Theme toggle (if in topbar) → light/dark.
- [ ] No console errors on navigation or form submit.

---

## 4. Suggested test cases to “win” the hackathon

These show off Starknet + optional Tongo and robustness.

### 4.1 Starknet / wallet

1. **Wallet connect**  
   Connect a Starknet wallet (e.g. ArgentX) on Sepolia. Topbar shows truncated address and disconnect. Disconnect and reconnect.

2. **Transfer without Tongo**  
   With wallet connected (or not, depending on your design), send a “normal” transfer. Confirm it appears in history and state is consistent.

3. **Transfer with Tongo (if configured)**  
   Set company Tongo key in transfer modal; choose an employee with Tongo public key; send. Confirm summary shows “Private transfer (Tongo)” and that the transaction is submitted on Starknet (and history updates).

### 4.2 Data & validation

4. **Employee validation**  
   - Add employee with invalid wallet (e.g. `0x123`) → error.  
   - Add with valid wallet (e.g. `0x` + 64 hex) → success.  
   - Edit and set salary to negative or empty required field → error.

5. **Persistence**  
   Add employees and transfers; refresh the page. Because state is in React context (in-memory), it resets. For the hackathon you can say “state is in-memory for demo; production would use contracts/backend.” If you later add contract or API persistence, add a test: “After refresh, data is restored from contract/API.”

### 4.3 UX & polish

6. **Keyboard and palette**  
   Demonstrate Cmd+K, Cmd+N, Cmd+T and that the palette lists employees and quick actions.

7. **Copy wallet**  
   Show copy on employee and transfer history; show “Copied” or icon change.

8. **Empty states**  
   With no employees, table shows “No employees yet. Add one to get started.” With no transfers, “No transfers yet. Use ‘New Transfer’…”.

### 4.4 Demo script (2–3 minutes)

1. Open app → Dashboard → Overview (stats + charts).
2. Add employee (with valid Starknet wallet and optional Tongo key) → show validation if you try invalid data.
3. New Transfer → select employee, amount → Summary → Confirm (show “Private (Tongo)” if keys set).
4. Show transfer in history and copy wallet.
5. Cmd+K → “Add employee” → sheet opens.
6. Optional: connect wallet and show Tongo path once.

---

## 5. Quick env reference

| Variable | Purpose | Required for |
|----------|---------|----------------|
| `VITE_PRIVY_APP_ID` | Privy auth | Optional (not used in current flow) |
| `VITE_STARKNET_NETWORK` | e.g. `sepolia` | Override default |
| `VITE_STARKNET_RPC_URL` | Starknet RPC | Override default |
| `VITE_PAYROLL_MANAGER_ADDRESS` | Payroll contract | Optional (for future contract integration) |
| **`VITE_TONGO_CONTRACT_ADDRESS`** | Tongo contract | **Tongo private transfers** |
| `VITE_TONGO_WRAPPER_ADDRESS` | Tongo wrapper | Optional |

**No external API keys** are required for the current app; only these env vars if you want Starknet + Tongo.

---

## 6. Build & run

```bash
npm install
npm run build
npm run dev
```

Open `http://localhost:5173` (or the URL shown). Use the run-through and test cases above to verify everything and prepare your demo.
