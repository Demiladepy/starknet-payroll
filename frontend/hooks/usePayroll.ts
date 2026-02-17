import { useContract, useContractWrite, useCall } from "@starknet-react/core";
import { contractAddresses } from "@/lib/starknet";
import { PayrollManagerABI } from "@/abi/PayrollManager";
import {
  addEmployeeCall,
  executePayrollCall,
  setPaymentScheduleCall,
} from "@/lib/contract-calls";

const abi = PayrollManagerABI;

export function usePayrollContract() {
  const address = contractAddresses.payrollManager;
  const { contract } = useContract({
    address: address || undefined,
    abi,
  });
  return { contract, address };
}

export function useAddEmployee() {
  const { writeAsync } = useContractWrite({});
  const address = contractAddresses.payrollManager;

  return {
    addEmployee: async (
      employeeAddress: string,
      encryptedSalaryC1: string,
      encryptedSalaryC2: string,
      publicKey: string
    ) => {
      if (!address) {
        throw new Error("PayrollManager contract address not set");
      }
      const call = addEmployeeCall(
        address,
        employeeAddress,
        encryptedSalaryC1,
        encryptedSalaryC2,
        publicKey
      );
      const result = await writeAsync({ calls: [call] });
      return result;
    },
    hasContract: !!address,
  };
}

export function useExecutePayroll() {
  const { writeAsync } = useContractWrite({});
  const address = contractAddresses.payrollManager;

  return {
    executePayroll: async () => {
      if (!address) {
        throw new Error("PayrollManager contract address not set");
      }
      const call = executePayrollCall(address);
      const result = await writeAsync({ calls: [call] });
      return result;
    },
    hasContract: !!address,
  };
}

export function useSetPaymentSchedule() {
  const { writeAsync } = useContractWrite({});
  const address = contractAddresses.payrollManager;

  return {
    setPaymentSchedule: async (frequency: string | number, nextPayment: string | number) => {
      if (!address) {
        throw new Error("PayrollManager contract address not set");
      }
      const call = setPaymentScheduleCall(address, frequency, nextPayment);
      const result = await writeAsync({ calls: [call] });
      return result;
    },
    hasContract: !!address,
  };
}

/** Read payment schedule from chain when PayrollManager address is set. */
export function usePaymentScheduleFromChain() {
  const address = contractAddresses.payrollManager;
  const result = useCall({
    address: address || undefined,
    abi,
    functionName: "get_payment_schedule",
    args: [],
    parseResult: true,
  });

  const scheduleRaw = result.data as
    | { frequency?: bigint; next_payment?: bigint }
    | [bigint, bigint]
    | undefined;

  const schedule =
    Array.isArray(scheduleRaw) && scheduleRaw.length >= 2
      ? { frequency: scheduleRaw[0], next_payment: scheduleRaw[1] }
      : scheduleRaw;

  return {
    schedule: schedule
      ? {
          frequency: Number(schedule.frequency ?? 0),
          nextPayment: Number(schedule.next_payment ?? 0),
        }
      : null,
    isLoading: result.isPending,
    error: result.error,
    hasContract: !!address,
  };
}
