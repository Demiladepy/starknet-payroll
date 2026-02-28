import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import {
  seedEmployees,
  type Employee,
  type Transfer,
} from "~/lib/seed";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((s) => s[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

type DashboardContextValue = {
  employees: Employee[];
  transfers: Transfer[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  setTransfers: React.Dispatch<React.SetStateAction<Transfer[]>>;
  addEmployee: (e: Omit<Employee, "id" | "avatar">) => void;
  updateEmployee: (id: string, e: Partial<Employee>) => void;
  removeEmployee: (id: string) => void;
  addTransfer: (t: Omit<Transfer, "id" | "date">) => void;
};

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [employees, setEmployees] = useState<Employee[]>(() => seedEmployees());
  const [transfers, setTransfers] = useState<Transfer[]>([]);

  const addEmployee = useCallback((e: Omit<Employee, "id" | "avatar">) => {
    setEmployees((prev) => {
      const id = String(
        Math.max(0, ...prev.map((x) => parseInt(x.id, 10))) + 1
      );
      return [
        ...prev,
        {
          ...e,
          id,
          avatar: initials(e.name),
        },
      ];
    });
  }, []);

  const updateEmployee = useCallback((id: string, updates: Partial<Employee>) => {
    setEmployees((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              ...updates,
              ...(updates.name && { avatar: initials(updates.name) }),
            }
          : e
      )
    );
  }, []);

  const removeEmployee = useCallback((id: string) => {
    setEmployees((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const addTransfer = useCallback((t: Omit<Transfer, "id" | "date">) => {
    setTransfers((prev) => [
      ...prev,
      {
        ...t,
        id: String(Date.now()),
        date: new Date().toISOString(),
      },
    ]);
  }, []);

  return (
    <DashboardContext.Provider
      value={{
        employees,
        transfers,
        setEmployees,
        setTransfers,
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

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx)
    throw new Error("useDashboard must be used within DashboardProvider");
  return ctx;
}
