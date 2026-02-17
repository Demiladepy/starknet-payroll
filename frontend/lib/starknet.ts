import { Provider, RpcProvider } from "starknet";

const network = process.env.NEXT_PUBLIC_STARKNET_NETWORK || "sepolia";
const rpcUrl = process.env.NEXT_PUBLIC_STARKNET_RPC_URL || "https://starknet-sepolia.public.blastapi.io";

export const provider = new RpcProvider({
  nodeUrl: rpcUrl,
});

export const networkConfig = {
  network,
  rpcUrl,
};

export const contractAddresses = {
  payrollManager: process.env.NEXT_PUBLIC_PAYROLL_MANAGER_ADDRESS || "",
  complianceModule: process.env.NEXT_PUBLIC_COMPLIANCE_MODULE_ADDRESS || "",
  employeeAccount: process.env.NEXT_PUBLIC_EMPLOYEE_ACCOUNT_ADDRESS || "",
  usdcToken: process.env.NEXT_PUBLIC_USDC_TOKEN_ADDRESS || "",
  tongoWrapper: process.env.NEXT_PUBLIC_TONGO_WRAPPER_ADDRESS || "",
};
