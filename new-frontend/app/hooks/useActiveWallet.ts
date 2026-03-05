/**
 * Unified wallet hook: prefer injected (Argent/Braavos), else Starkzap.
 * Gives a single execute() and address for transfer flows.
 */

import { useAccount } from "@starknet-react/core";
import { useStarkzap } from "~/contexts/StarkzapContext";
import type { Call } from "starknet";

type WalletType = "injected" | "starkzap" | null;

export type ActiveWallet = {
  address: string | null;
  type: WalletType;
  isConnected: boolean;
  walletName: string;
  /** Execute calls; returns result with transaction_hash when available. */
  execute: (calls: Call | Call[]) => Promise<{ transaction_hash?: string }>;
};

export function useActiveWallet(): ActiveWallet {
  const { address: injectedAddress, account, status } = useAccount();
  const { wallet: starkzapWallet } = useStarkzap();

  const isInjectedConnected = status === "connected" && !!injectedAddress && !!account;
  const isStarkzapConnected = !!starkzapWallet;

  if (isInjectedConnected && account) {
    return {
      address: injectedAddress ?? null,
      type: "injected",
      isConnected: true,
      walletName: "Argent X / Braavos",
      execute: async (callsOrOne: Call | Call[]) => {
        const normalized = Array.isArray(callsOrOne) ? callsOrOne : [callsOrOne];
        const result = await account.execute(normalized);
        return { transaction_hash: (result as { transaction_hash?: string })?.transaction_hash };
      },
    };
  }

  if (isStarkzapConnected && starkzapWallet) {
    return {
      address: typeof starkzapWallet.address === "string" ? starkzapWallet.address : String(starkzapWallet.address),
      type: "starkzap",
      isConnected: true,
      walletName: "Starkzap",
      execute: async (callsOrOne: Call | Call[]) => {
        const normalized = Array.isArray(callsOrOne) ? callsOrOne : [callsOrOne];
        const tx = await starkzapWallet.execute(normalized);
        const hash = (tx as { transaction_hash?: string })?.transaction_hash ?? (tx as { transactionHash?: string })?.transactionHash;
        return { transaction_hash: hash };
      },
    };
  }

  return {
    address: null,
    type: null,
    isConnected: false,
    walletName: "",
    execute: async () => {
      throw new Error("No wallet connected");
    },
  };
}
