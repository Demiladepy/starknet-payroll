import { useAccount } from "@starknet-react/core";
import { useStarkzap } from "../contexts/StarkzapContext";
import type { Call } from "starknet";

export interface ActiveWallet {
  address: string | null;
  type: "injected" | "starkzap" | null;
  isConnected: boolean;
  walletName: string;
  execute: (calls: Call | Call[]) => Promise<{ transaction_hash: string }>;
  canExecute: boolean;
}

export function useActiveWallet(): ActiveWallet {
  const { address: injectedAddress, account: injectedAccount, status } = useAccount();
  const isInjectedConnected = status === "connected" && !!injectedAddress;

  const {
    address: starkzapAddress,
    wallet: starkzapWallet,
    isConnected: starkzapConnected,
  } = useStarkzap();

  // Priority: injected wallet first (has real funds)
  if (isInjectedConnected && injectedAccount) {
    return {
      address: injectedAddress!,
      type: "injected",
      isConnected: true,
      walletName: "Argent X / Braavos",
      canExecute: true,
      execute: async (calls) => {
        const callArray = Array.isArray(calls) ? calls : [calls];
        const result = await injectedAccount.execute(callArray);
        return { transaction_hash: result.transaction_hash };
      },
    };
  }

  if (starkzapConnected && starkzapWallet) {
    return {
      address: starkzapAddress!,
      type: "starkzap",
      isConnected: true,
      walletName: "StarkZap",
      canExecute: false, // demo signer has no funds
      execute: async (calls) => {
        const callArray = Array.isArray(calls) ? calls : [calls];
        const tx = await starkzapWallet.execute(callArray);
        return {
          transaction_hash: tx.hash || tx.transaction_hash || "0x_unknown",
        };
      },
    };
  }

  return {
    address: null,
    type: null,
    isConnected: false,
    walletName: "",
    canExecute: false,
    execute: async () => { throw new Error("No wallet connected"); },
  };
}
