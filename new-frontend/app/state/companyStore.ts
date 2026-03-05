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
      employees: [],
      transfers: [],
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

