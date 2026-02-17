import { useContractWrite } from "@starknet-react/core";
import { contractAddresses } from "@/lib/starknet";
import { addSessionKeyCall, removeSessionKeyCall } from "@/lib/contract-calls";

export function useSessionKeys() {
  const { writeAsync } = useContractWrite({});
  const address = contractAddresses.employeeAccount;

  return {
    addSessionKey: async (sessionKey: string, expiry: number) => {
      if (!address) throw new Error("EmployeeAccount contract address not set");
      const call = addSessionKeyCall(address, sessionKey, expiry);
      return writeAsync({ calls: [call] });
    },
    removeSessionKey: async (sessionKey: string) => {
      if (!address) throw new Error("EmployeeAccount contract address not set");
      const call = removeSessionKeyCall(address, sessionKey);
      return writeAsync({ calls: [call] });
    },
    hasContract: !!address,
  };
}
