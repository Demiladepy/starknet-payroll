import { create } from "zustand";
import { persist } from "zustand/middleware";

export type TokenSymbol = "STRK" | "ETH" | "USDC";
export type TransferType = "direct" | "starkzap" | "tongo";
export type TransferStatus = "pending" | "completed" | "failed";

function id(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (crypto as any).randomUUID();
  }
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export type Employee = {
  id: string;
  name: string;
  role: string;
  department: string;
  salary: number;
  address: string;
  status: "active" | "inactive";
  hireDate: string; // YYYY-MM-DD
  avatar: string; // initials
  tongoPublicKey?: string;
};

export type UnifiedTransfer = {
  id: string;
  type: TransferType;
  from: string; // company wallet or "Tongo Pool"
  to: { name: string; address: string };
  amount: number;
  token: TokenSymbol;
  txHash: string;
  status: TransferStatus;
  timestamp: string; // ISO
  note?: string;
  private: boolean;
  tongoNoteHash?: string;
};

export type TongoNote = {
  id: string;
  token: TokenSymbol;
  denominationUsd: number;
  createdAt: string; // ISO
  secretNote: string; // 0x + 64 hex chars
  noteHash: string; // mock hash
  status: "deposited" | "withdrawn" | "expired";
  withdrawnTo?: string;
  withdrawnAt?: string;
};

export type WalletBalances = Record<TokenSymbol, number>;
export type WalletState =
  | {
      connected: false;
    }
  | {
      connected: true;
      mode: "injected" | "starkzap" | "mock";
      address: string;
      balances: WalletBalances;
    };

type Filters = {
  type?: TransferType;
  token?: TokenSymbol;
  employeeId?: string;
  fromDate?: string; // ISO date (YYYY-MM-DD)
  toDate?: string; // ISO date (YYYY-MM-DD)
};

type CompanyState = {
  demoMode: boolean;
  wallet: WalletState;
  employees: Employee[];
  transfers: UnifiedTransfer[];
  tongoNotes: TongoNote[];
  historyFilters: Filters;

  setDemoMode: (enabled: boolean) => void;
  connectMockWallet: () => void;
  disconnectWallet: () => void;
  setInjectedWallet: (address: string, balances?: Partial<WalletBalances>) => void;
  setStarkzapWallet: (address: string, balances?: Partial<WalletBalances>) => void;
  setWalletBalances: (balances: Partial<WalletBalances>) => void;

  seedDemoData: () => void;
  resetAll: () => void;

  addEmployee: (e: Omit<Employee, "id" | "avatar">) => void;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
  removeEmployee: (id: string) => void;

  addTransfer: (t: Omit<UnifiedTransfer, "id" | "timestamp">) => string;
  updateTransferStatus: (id: string, status: TransferStatus) => void;

  addTongoNote: (n: Omit<TongoNote, "id" | "createdAt" | "noteHash" | "status">) => TongoNote;
  markTongoWithdrawn: (noteId: string, toAddress: string) => void;

  setHistoryFilters: (filters: Partial<Filters>) => void;
};

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((s) => s[0]!)
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function randomHex(bytes: number): string {
  const buf = new Uint8Array(bytes);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) crypto.getRandomValues(buf);
  return Array.from(buf)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Mock tx hash for non–on-chain transfers; prefix so Starkscan is not linked. */
export function mockTxHash(): string {
  return `0xMOCK_${Date.now().toString(16)}${randomHex(4)}`;
}

export function mockSecretNote(): string {
  return `0x${randomHex(32)}`.padEnd(66, "0"); // ensure 64 hex chars after 0x
}

export function mockNoteHash(secretNote: string): string {
  // Not cryptographically correct; good enough for demo visuals.
  const tail = secretNote.slice(-16).padStart(16, "0");
  return `0x${"0".repeat(48)}${tail}`;
}

/** Spec-style seed employees (5) for first-load / demo */
const SEED_EMPLOYEES_RAW: Array<Omit<Employee, "id" | "avatar">> = [
  {
    name: "Alice Chen",
    role: "Senior Engineer",
    department: "Engineering",
    salary: 2.5,
    address: "0x04a1f292e0321579bC56bE2D90F6e31aC86bCd88A5A4a4C5F1263B83BE5e2a61",
    status: "active",
    hireDate: new Date(Date.now() - 90 * 86400000).toISOString().slice(0, 10),
    tongoPublicKey: "0x02abc123def456789012345678901234567890123456789012345678901234abcd",
  },
  {
    name: "Bob Martinez",
    role: "Product Designer",
    department: "Design",
    salary: 2.0,
    address: "0x07be3e456c8b2c45e89dc02bc6d8e9f4c73ae5d12b7f08a612cc9e3f7b842190",
    status: "active",
    hireDate: new Date(Date.now() - 60 * 86400000).toISOString().slice(0, 10),
    tongoPublicKey: "0x03def789abc012345678901234567890123456789012345678901234567890cdef",
  },
  {
    name: "Carol Williams",
    role: "Marketing Lead",
    department: "Marketing",
    salary: 1.8,
    address: "0x01cf4a5b7d8e2f63c09ab1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8091a2b3c4d5",
    status: "active",
    hireDate: new Date(Date.now() - 45 * 86400000).toISOString().slice(0, 10),
  },
  {
    name: "David Kim",
    role: "DevOps Engineer",
    department: "Engineering",
    salary: 2.3,
    address: "0x06e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6",
    status: "active",
    hireDate: new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10),
    tongoPublicKey: "0x04ghi012jkl3456789012345678901234567890123456789012345678901234ghij",
  },
  {
    name: "Eve Johnson",
    role: "HR Manager",
    department: "HR",
    salary: 1.5,
    address: "0x05d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5",
    status: "active",
    hireDate: new Date(Date.now() - 15 * 86400000).toISOString().slice(0, 10),
  },
];

function getDefaultSeedEmployees(): Employee[] {
  return SEED_EMPLOYEES_RAW.map((e, idx) => ({
    ...e,
    id: `emp-${idx + 1}`,
    avatar: initials(e.name),
  }));
}

function getDefaultSeedTransfers(): UnifiedTransfer[] {
  const employees = getDefaultSeedEmployees();
  const now = Date.now();
  return [
    {
      id: "tx-1",
      type: "tongo",
      from: "Company",
      to: { name: employees[0]!.name, address: employees[0]!.address },
      amount: 2.5,
      token: "USDC",
      txHash: "0x04a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0",
      status: "completed",
      timestamp: new Date(now - 3 * 86400000).toISOString(),
      note: "March salary",
      private: true,
    },
    {
      id: "tx-2",
      type: "tongo",
      from: "Company",
      to: { name: employees[1]!.name, address: employees[1]!.address },
      amount: 2.0,
      token: "USDC",
      txHash: "0x05b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f01a",
      status: "completed",
      timestamp: new Date(now - 3 * 86400000).toISOString(),
      note: "March salary",
      private: true,
    },
    {
      id: "tx-3",
      type: "direct",
      from: "Company",
      to: { name: employees[2]!.name, address: employees[2]!.address },
      amount: 1.8,
      token: "USDC",
      txHash: mockTxHash(),
      status: "completed",
      timestamp: new Date(now - 3 * 86400000).toISOString(),
      private: false,
    },
    {
      id: "tx-4",
      type: "tongo",
      from: "Company",
      to: { name: employees[3]!.name, address: employees[3]!.address },
      amount: 2.3,
      token: "USDC",
      txHash: "0x06c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f01a2b",
      status: "pending",
      timestamp: new Date(now - 1 * 86400000).toISOString(),
      note: "March salary + bonus",
      private: true,
    },
    {
      id: "tx-5",
      type: "direct",
      from: "Company",
      to: { name: employees[0]!.name, address: employees[0]!.address },
      amount: 0.5,
      token: "USDC",
      txHash: mockTxHash(),
      status: "completed",
      timestamp: new Date(now - 10 * 86400000).toISOString(),
      note: "Performance bonus",
      private: false,
    },
    {
      id: "tx-6",
      type: "direct",
      from: "Company",
      to: { name: employees[4]!.name, address: employees[4]!.address },
      amount: 1.5,
      token: "USDC",
      txHash: "",
      status: "failed",
      timestamp: new Date(now - 7 * 86400000).toISOString(),
      private: false,
    },
  ];
}

/** Demo seed (3 employees) for "Run Full Demo" / demo mode */
const DEMO_EMPLOYEES: Array<Omit<Employee, "id" | "avatar">> = [
  {
    name: "Adebayo Ogunlade",
    role: "Senior Dev",
    department: "Engineering",
    salary: 4500,
    address: "0x04a1d2c3b4a5968778695a4b3c2d1e0f04a17e3b04a1d2c3b4a5968778695a4b",
    status: "active",
    hireDate: "2024-05-10",
    tongoPublicKey: "0x01".padEnd(66, "1"),
  },
  {
    name: "Chioma Eze",
    role: "Product Designer",
    department: "Design",
    salary: 3800,
    address: "0x01cd9a8b7f1234567890abcdef01234567890abcdef01234567890abcdef8a7f",
    status: "active",
    hireDate: "2023-10-02",
    tongoPublicKey: "0x02".padEnd(66, "2"),
  },
  {
    name: "Emeka Nwosu",
    role: "Marketing Lead",
    department: "Marketing",
    salary: 4200,
    address: "0x09efab3b6a1234567890abcdef01234567890abcdef01234567890abcdef3b6a",
    status: "active",
    hireDate: "2022-08-19",
    tongoPublicKey: "0x03".padEnd(66, "3"),
  },
];

function demoTransfers(companyFrom: string): UnifiedTransfer[] {
  const now = Date.now();
  return [
    {
      id: id(),
      type: "starkzap",
      from: companyFrom,
      to: { name: "Adebayo Ogunlade", address: DEMO_EMPLOYEES[0]!.address },
      amount: 4500,
      token: "STRK",
      txHash: mockTxHash(),
      status: "completed",
      timestamp: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(),
      private: false,
      note: "Monthly salary",
    },
    {
      id: id(),
      type: "tongo",
      from: "Tongo Pool",
      to: { name: "Chioma Eze", address: DEMO_EMPLOYEES[1]!.address },
      amount: 3800,
      token: "USDC",
      txHash: mockTxHash(),
      status: "completed",
      timestamp: new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString(),
      private: true,
      tongoNoteHash: mockNoteHash("0x" + "a".repeat(64)),
      note: "Private payroll",
    },
    {
      id: id(),
      type: "direct",
      from: companyFrom,
      to: { name: "Emeka Nwosu", address: DEMO_EMPLOYEES[2]!.address },
      amount: 4200,
      token: "ETH",
      txHash: mockTxHash(),
      status: "completed",
      timestamp: new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString(),
      private: false,
      note: "Bonus payout",
    },
  ];
}

const STORAGE_KEY = "company_dashboard_v1";

export const useCompanyStore = create<CompanyState>()(
  persist(
    (set, get) => ({
      demoMode: false,
      wallet: { connected: false },
      employees: getDefaultSeedEmployees(),
      transfers: getDefaultSeedTransfers(),
      tongoNotes: [],
      historyFilters: {},

      setDemoMode: (enabled) => {
        set({ demoMode: enabled });
        if (enabled) {
          get().connectMockWallet();
          get().seedDemoData();
        }
      },

      connectMockWallet: () => {
        set({
          wallet: {
            connected: true,
            mode: "mock",
            address: "0x04a1d2c3b4a5968778695a4b3c2d1e0f04a17e3b04a1d2c3b4a5968778697e3b",
            balances: { STRK: 5000, ETH: 2.5, USDC: 10000 },
          },
        });
      },

      disconnectWallet: () => set({ wallet: { connected: false } }),

      setInjectedWallet: (address, balances) => {
        const prev = get().wallet;
        const fallbackBalances: WalletBalances =
          prev.connected ? prev.balances : { STRK: 0, ETH: 0, USDC: 0 };
        set({
          wallet: {
            connected: true,
            mode: "injected",
            address,
            balances: { ...fallbackBalances, ...(balances ?? {}) },
          },
        });
      },

      setStarkzapWallet: (address, balances) => {
        const prev = get().wallet;
        const fallbackBalances: WalletBalances =
          prev.connected ? prev.balances : { STRK: 0, ETH: 0, USDC: 0 };
        set({
          wallet: {
            connected: true,
            mode: "starkzap",
            address,
            balances: { ...fallbackBalances, ...(balances ?? {}) },
          },
        });
      },

      setWalletBalances: (balances) => {
        const w = get().wallet;
        if (!w.connected) return;
        set({ wallet: { ...w, balances: { ...w.balances, ...balances } } });
      },

      seedDemoData: () => {
        const w = get().wallet;
        const companyFrom = w.connected ? w.address : "Company";
        set((s) => {
          if (s.employees.length > 0 || s.transfers.length > 0) return s;
          const seededEmployees = DEMO_EMPLOYEES.map((e, idx) => ({
            ...e,
            id: String(idx + 1),
            avatar: initials(e.name),
          }));
          return {
            ...s,
            employees: seededEmployees,
            transfers: demoTransfers(companyFrom),
          };
        });
      },

      resetAll: () =>
        set({
          demoMode: false,
          wallet: { connected: false },
          employees: [],
          transfers: [],
          tongoNotes: [],
          historyFilters: {},
        }),

      addEmployee: (e) => {
        set((s) => ({
          employees: [
            ...s.employees,
            { ...e, id: id(), avatar: initials(e.name) },
          ],
        }));
      },

      updateEmployee: (id, updates) => {
        set((s) => ({
          employees: s.employees.map((e) =>
            e.id === id
              ? {
                  ...e,
                  ...updates,
                  ...(updates.name ? { avatar: initials(updates.name) } : null),
                }
              : e
          ),
        }));
      },

      removeEmployee: (id) => {
        set((s) => ({ employees: s.employees.filter((e) => e.id !== id) }));
      },

      addTransfer: (t) => {
        const transferId = id();
        set((s) => ({
          transfers: [
            ...s.transfers,
            { ...t, id: transferId, timestamp: new Date().toISOString() },
          ],
        }));
        return transferId;
      },

      updateTransferStatus: (id, status) => {
        set((s) => ({
          transfers: s.transfers.map((t) => (t.id === id ? { ...t, status } : t)),
        }));
      },

      addTongoNote: (n) => {
        const secretNote = n.secretNote;
        const noteHash = mockNoteHash(secretNote);
        const note: TongoNote = {
          id: id(),
          createdAt: new Date().toISOString(),
          noteHash,
          status: "deposited",
          ...n,
        };
        set((s) => ({ tongoNotes: [note, ...s.tongoNotes] }));
        return note;
      },

      markTongoWithdrawn: (noteId, toAddress) => {
        set((s) => ({
          tongoNotes: s.tongoNotes.map((n) =>
            n.id === noteId
              ? {
                  ...n,
                  status: "withdrawn",
                  withdrawnTo: toAddress,
                  withdrawnAt: new Date().toISOString(),
                }
              : n
          ),
        }));
      },

      setHistoryFilters: (filters) =>
        set((s) => ({ historyFilters: { ...s.historyFilters, ...filters } })),
    }),
    { name: STORAGE_KEY, version: 1 }
  )
);

