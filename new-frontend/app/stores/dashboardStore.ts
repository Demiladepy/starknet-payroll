import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  salary: number;
  walletAddress: string;
  tongoPublicKey?: string;
  createdAt: string;
}

export interface Transfer {
  id: string;
  employeeId: string;
  employeeName: string;
  amount: number;
  note?: string;
  status: "pending" | "completed" | "failed";
  type: "tongo_private" | "standard";
  txHash?: string;
  createdAt: string;
}

const SEED_EMPLOYEES: Employee[] = [
  { id: "emp-1", name: "Alice Chen", role: "Senior Engineer", department: "Engineering", salary: 2.5, walletAddress: "0x04a1f292e0321579bC56bE2D90F6e31aC86bCd88A5A4a4C5F1263B83BE5e2a61", tongoPublicKey: "0x02abc123def456789", createdAt: new Date(Date.now() - 90 * 86400000).toISOString() },
  { id: "emp-2", name: "Bob Martinez", role: "Product Designer", department: "Design", salary: 2.0, walletAddress: "0x07be3e456c8b2c45e89dc02bc6d8e9f4c73ae5d12b7f08a612cc9e3f7b842190", tongoPublicKey: "0x03def789abc012345", createdAt: new Date(Date.now() - 60 * 86400000).toISOString() },
  { id: "emp-3", name: "Carol Williams", role: "Marketing Lead", department: "Marketing", salary: 1.8, walletAddress: "0x01cf4a5b7d8e2f63c09ab1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8091a2b3c4d5", createdAt: new Date(Date.now() - 45 * 86400000).toISOString() },
  { id: "emp-4", name: "David Kim", role: "DevOps Engineer", department: "Engineering", salary: 2.3, walletAddress: "0x06e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6", tongoPublicKey: "0x04ghi012jkl345678", createdAt: new Date(Date.now() - 30 * 86400000).toISOString() },
  { id: "emp-5", name: "Eve Johnson", role: "HR Manager", department: "HR", salary: 1.5, walletAddress: "0x05d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5", createdAt: new Date(Date.now() - 15 * 86400000).toISOString() },
];

const SEED_TRANSFERS: Transfer[] = [
  { id: "tx-1", employeeId: "emp-1", employeeName: "Alice Chen", amount: 2.5, note: "March salary", status: "completed", type: "tongo_private", txHash: "0x04a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0", createdAt: new Date(Date.now() - 3 * 86400000).toISOString() },
  { id: "tx-2", employeeId: "emp-2", employeeName: "Bob Martinez", amount: 2.0, note: "March salary", status: "completed", type: "tongo_private", txHash: "0x05b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f01a", createdAt: new Date(Date.now() - 3 * 86400000).toISOString() },
  { id: "tx-3", employeeId: "emp-3", employeeName: "Carol Williams", amount: 1.8, status: "completed", type: "standard", txHash: "0xMOCK_carol_march", createdAt: new Date(Date.now() - 3 * 86400000).toISOString() },
  { id: "tx-4", employeeId: "emp-4", employeeName: "David Kim", amount: 2.3, note: "March + bonus", status: "pending", type: "tongo_private", txHash: "0x06c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f01a2b", createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: "tx-5", employeeId: "emp-1", employeeName: "Alice Chen", amount: 0.5, note: "Bonus", status: "completed", type: "standard", txHash: "0xMOCK_alice_bonus", createdAt: new Date(Date.now() - 10 * 86400000).toISOString() },
  { id: "tx-6", employeeId: "emp-5", employeeName: "Eve Johnson", amount: 1.5, status: "failed", type: "standard", createdAt: new Date(Date.now() - 7 * 86400000).toISOString() },
];

interface DashboardStore {
  employees: Employee[];
  transfers: Transfer[];
  addEmployee: (e: Employee) => void;
  updateEmployee: (id: string, data: Partial<Employee>) => void;
  removeEmployee: (id: string) => void;
  addTransfer: (t: Transfer) => void;
  updateTransferStatus: (id: string, status: Transfer["status"]) => void;
}

export const useDashboardStore = create<DashboardStore>()(
  persist(
    (set) => ({
      employees: SEED_EMPLOYEES,
      transfers: SEED_TRANSFERS,
      addEmployee: (e) => set((s) => ({ employees: [...s.employees, e] })),
      updateEmployee: (id, data) => set((s) => ({
        employees: s.employees.map((e) => e.id === id ? { ...e, ...data } : e),
      })),
      removeEmployee: (id) => set((s) => ({
        employees: s.employees.filter((e) => e.id !== id),
      })),
      addTransfer: (t) => set((s) => ({ transfers: [t, ...s.transfers] })),
      updateTransferStatus: (id, status) => set((s) => ({
        transfers: s.transfers.map((t) => t.id === id ? { ...t, status } : t),
      })),
    }),
    { name: "starkpayroll-dashboard" }
  )
);
