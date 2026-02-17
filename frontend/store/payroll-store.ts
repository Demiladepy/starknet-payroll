import { create } from "zustand";
import { Employee, PaymentSchedule } from "@/types";

interface PayrollState {
  employees: Employee[];
  paymentSchedule: PaymentSchedule | null;
  isLoading: boolean;
  error: string | null;
  
  setEmployees: (employees: Employee[]) => void;
  addEmployee: (employee: Employee) => void;
  removeEmployee: (address: string) => void;
  setPaymentSchedule: (schedule: PaymentSchedule) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const usePayrollStore = create<PayrollState>((set) => ({
  employees: [],
  paymentSchedule: null,
  isLoading: false,
  error: null,

  setEmployees: (employees) => set({ employees }),
  addEmployee: (employee) => set((state) => ({ 
    employees: [...state.employees, employee] 
  })),
  removeEmployee: (address) => set((state) => ({
    employees: state.employees.filter((e) => e.address !== address),
  })),
  setPaymentSchedule: (schedule) => set({ paymentSchedule: schedule }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
