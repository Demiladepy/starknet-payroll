import { createContext, useCallback, useContext, type ReactNode } from "react";
import {
  useCompanyStore,
  mockTxHash,
  type Employee,
  type UnifiedTransfer,
} from "~/state/companyStore";

type LegacyTransferInput = {
  employeeId: string;
  employeeName: string;
  amount: number;
  note: string;
  address: string;
};

type DashboardContextValue = {
  employees: Employee[];
  transfers: UnifiedTransfer[];
  addEmployee: (e: Omit<Employee, "id" | "avatar">) => void;
  updateEmployee: (id: string, e: Partial<Employee>) => void;
  removeEmployee: (id: string) => void;
  addTransfer: (t: LegacyTransferInput) => string;
};

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const wallet = useCompanyStore((s) => s.wallet);
  const employees = useCompanyStore((s) => s.employees);
  const transfers = useCompanyStore((s) => s.transfers);
  const addEmployee = useCompanyStore((s) => s.addEmployee);
  const updateEmployee = useCompanyStore((s) => s.updateEmployee);
  const removeEmployee = useCompanyStore((s) => s.removeEmployee);
  const addTransferStore = useCompanyStore((s) => s.addTransfer);

  const addTransfer = useCallback(
    (t: LegacyTransferInput) => {
      const from = wallet.connected ? wallet.address : "Company";
      return addTransferStore({
        type: "direct",
        from,
        to: { name: t.employeeName, address: t.address },
        amount: t.amount,
        token: "USDC",
        txHash: mockTxHash(),
        status: "completed",
        note: t.note || undefined,
        private: false,
      });
    },
    [wallet, addTransferStore]
  );

  return (
    <DashboardContext.Provider
      value={{
        employees,
        transfers,
        addEmployee,
        updateEmployee,
        removeEmployee,
        addTransfer,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard(): DashboardContextValue {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard must be used within DashboardProvider");
  return ctx;
}
