import { useContractWrite } from "@starknet-react/core";
import { contractAddresses } from "@/lib/starknet";
import { ComplianceModuleABI } from "@/abi/ComplianceModule";
import { grantViewingKeyCall } from "@/lib/contract-calls";

export function useGrantViewingKey() {
  const { writeAsync } = useContractWrite({});
  const address = contractAddresses.complianceModule;

  return {
    grantViewingKey: async (
      auditorAddress: string,
      viewingKey: string,
      timeRangeStart: number,
      timeRangeEnd: number
    ) => {
      if (!address) {
        throw new Error("ComplianceModule contract address not set");
      }
      const call = grantViewingKeyCall(
        address,
        auditorAddress,
        viewingKey,
        timeRangeStart,
        timeRangeEnd
      );
      const result = await writeAsync({ calls: [call] });
      return result;
    },
    hasContract: !!address,
  };
}
