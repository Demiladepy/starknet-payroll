/**
 * Starknet and contract config from env (VITE_* for Vite client exposure).
 */
const network = import.meta.env.VITE_STARKNET_NETWORK ?? "sepolia";
const rpcUrl =
  import.meta.env.VITE_STARKNET_RPC_URL ??
  "https://starknet-sepolia.public.blastapi.io";

export const starknetConfig = {
  network,
  rpcUrl,
};

export const contractAddresses = {
  payrollManager: import.meta.env.VITE_PAYROLL_MANAGER_ADDRESS ?? "",
  tongo: import.meta.env.VITE_TONGO_CONTRACT_ADDRESS ?? "",
  tongoWrapper: import.meta.env.VITE_TONGO_WRAPPER_ADDRESS ?? "",
};
