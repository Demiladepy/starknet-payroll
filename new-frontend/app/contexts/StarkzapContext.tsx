import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";

interface StarkzapWallet {
  address: string;
  execute: (calls: any[], options?: any) => Promise<any>;
  transfer: (token: any, transfers: any[]) => Promise<any>;
  balanceOf: (token: any) => Promise<any>;
  isDeployed: () => Promise<boolean>;
  deploy: (options?: any) => Promise<any>;
  ensureReady: (options?: any) => Promise<void>;
  getProvider: () => any;
  getChainId: () => any;
}

interface StarkzapContextValue {
  isConnected: boolean;
  isConnecting: boolean;
  address: string | null;
  wallet: StarkzapWallet | null;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  clearError: () => void;
}

const StarkzapContext = createContext<StarkzapContextValue | null>(null);

export function useStarkzap(): StarkzapContextValue {
  const ctx = useContext(StarkzapContext);
  if (!ctx) throw new Error("useStarkzap must be used within <StarkzapProvider>");
  return ctx;
}

export function StarkzapProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [wallet, setWallet] = useState<StarkzapWallet | null>(null);
  const [error, setError] = useState<string | null>(null);
  const sdkRef = useRef<any>(null);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      // STEP 1: Dynamic import — avoids SSR crash
      const starkzapModule = await import("starkzap");
      const { StarkZap, StarkSigner } = starkzapModule;

      // STEP 2: Create SDK instance (reuse across reconnects)
      const network = (import.meta.env.VITE_STARKNET_NETWORK as any) || "sepolia";
      if (!sdkRef.current) {
        sdkRef.current = new StarkZap({
          network,
          explorer: { provider: "starkscan" },
        });
      }
      const sdk = sdkRef.current;

      // STEP 3: Random private key for demo signer
      // 31 bytes to stay within Stark curve order
      const randomBytes = new Uint8Array(31);
      crypto.getRandomValues(randomBytes);
      const privateKey = "0x" + Array.from(randomBytes)
        .map((b) => b.toString(16).padStart(2, "0")).join("");
      const signer = new StarkSigner(privateKey);

      // STEP 4: Connect using connectWallet() — NOT onboard()
      // connectWallet() does NOT attempt deployment.
      // This is the fix — onboard() with deploy:"if_needed" fails without ETH.
      const connectedWallet: StarkzapWallet = await sdk.connectWallet({
        account: { signer },
      });

      // STEP 5: Get address
      const walletAddress = typeof connectedWallet.address === "string"
        ? connectedWallet.address
        : String(connectedWallet.address);

      // STEP 6: Check deployment status (don't fail if undeployed)
      try {
        const deployed = await connectedWallet.isDeployed();
        if (!deployed) {
          console.warn("[StarkZap] Account not deployed. Transfers need deployment + funds.");
        }
      } catch (e) {
        console.warn("[StarkZap] Could not check deployment:", e);
      }

      // STEP 7: Success
      setWallet(connectedWallet);
      setAddress(walletAddress);
      setIsConnected(true);
      console.log("[StarkZap] Connected!", { address: walletAddress, network });

    } catch (err: any) {
      let message = err?.message || "Unknown error connecting to StarkZap";
      if (message.includes("fetch") || message.includes("network")) {
        message = "Network error — check internet and RPC URL";
      } else if (message.includes("is not a function")) {
        message = "StarkZap SDK API mismatch. Run: npm install starkzap";
      } else if (message.includes("Module not found")) {
        message = "StarkZap not installed. Run: npm install starkzap";
      }
      console.error("[StarkZap] Failed:", err);
      setError(message);
      setIsConnected(false);
      setWallet(null);
      setAddress(null);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setWallet(null);
    setAddress(null);
    setIsConnected(false);
    setError(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return (
    <StarkzapContext.Provider value={{
      isConnected, isConnecting, address, wallet, error,
      connect, disconnect, clearError,
    }}>
      {children}
    </StarkzapContext.Provider>
  );
}

export default StarkzapContext;
