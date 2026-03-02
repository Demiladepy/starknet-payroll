import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { WalletInterface } from "starkzap";

type StarkzapContextValue = {
  /** Wallet when connected via Starkzap; null otherwise */
  wallet: WalletInterface | null;
  /** Whether we are currently connecting (onboard in progress) */
  connecting: boolean;
  /** Connect via Starkzap using a demo in-memory signer (for hackathon visibility) */
  connectStarkzap: () => Promise<void>;
  /** Disconnect Starkzap wallet */
  disconnectStarkzap: () => Promise<void>;
  /** SDK instance (sepolia) for use in transfer flows if needed */
  sdk: import("starkzap").StarkSDK | null;
};

const StarkzapContext = createContext<StarkzapContextValue | null>(null);

/** Generate a random Starknet-style private key (32 bytes hex) for demo */
function randomPrivateKey(): string {
  const bytes = new Uint8Array(32);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  }
  return "0x" + Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function StarkzapProvider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<WalletInterface | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [sdk, setSdk] = useState<import("starkzap").StarkSDK | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (typeof window === "undefined") return;
    (async () => {
      try {
        const { StarkSDK } = await import("starkzap");
        if (cancelled) return;
        setSdk(new StarkSDK({ network: "sepolia" }));
      } catch {
        // ignore; user can still attempt connect which will lazy-init
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const connectStarkzap = useCallback(async () => {
    setConnecting(true);
    try {
      const { StarkSDK, StarkSigner } = await import("starkzap");
      const localSdk = sdk ?? new StarkSDK({ network: "sepolia" });
      if (!sdk) setSdk(localSdk);

      const privateKey = randomPrivateKey();
      const signer = new StarkSigner(privateKey);
      const w = await localSdk.connectWallet({
        account: { signer },
      });
      await w.ensureReady({ deploy: "if_needed" }).catch(() => {
        // Still set wallet so UI shows Starkzap connected; deploy may fail without gas
      });
      setWallet(w);
    } catch (e) {
      console.error("Starkzap connect failed:", e);
    } finally {
      setConnecting(false);
    }
  }, [sdk]);

  const disconnectStarkzap = useCallback(async () => {
    if (wallet) {
      try {
        await wallet.disconnect();
      } catch {}
      setWallet(null);
    }
  }, [wallet]);

  return (
    <StarkzapContext.Provider
      value={{
        wallet,
        connecting,
        connectStarkzap,
        disconnectStarkzap,
        sdk,
      }}
    >
      {children}
    </StarkzapContext.Provider>
  );
}

export function useStarkzap() {
  const ctx = useContext(StarkzapContext);
  if (!ctx) throw new Error("useStarkzap must be used within StarkzapProvider");
  return ctx;
}
