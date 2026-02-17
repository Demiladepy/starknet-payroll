import { create } from "zustand";
import { AccountInterface } from "starknet";

interface WalletState {
  account: AccountInterface | null;
  isConnected: boolean;
  address: string | null;
  
  setAccount: (account: AccountInterface | null) => void;
  setAddress: (address: string | null) => void;
  disconnect: () => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  account: null,
  isConnected: false,
  address: null,

  setAccount: (account) => set({ 
    account,
    isConnected: !!account,
    address: account?.address || null,
  }),
  setAddress: (address) => set({ address }),
  disconnect: () => set({ 
    account: null, 
    isConnected: false, 
    address: null 
  }),
}));
