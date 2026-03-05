import { useState, useEffect, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  StarknetConfig,
  jsonRpcProvider,
  useInjectedConnectors,
  argent,
  braavos,
  starkscan,
} from "@starknet-react/core";
import { sepolia } from "@starknet-react/chains";
import { StarkzapProvider } from "~/contexts/StarkzapContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60 * 1000 },
  },
});

/** Starknet v9 RPC; specVersion required for current starknet.js. */
const starknetProvider = jsonRpcProvider({
  rpc: (chain) => {
    const nodeUrl =
      import.meta.env.VITE_STARKNET_RPC_URL ??
      chain.rpcUrls?.public?.http?.[0] ??
      "https://starknet-sepolia.public.blastapi.io";
    return { nodeUrl, specVersion: "0.10.0" as const };
  },
});

function StarknetConnectorsClient({ children }: { children: ReactNode }) {
  const { connectors } = useInjectedConnectors({
    recommended: [argent(), braavos()],
    includeRecommended: "onlyIfNoConnectors",
  });

  return (
    <StarknetConfig
      chains={[sepolia]}
      provider={starknetProvider}
      connectors={connectors}
      queryClient={queryClient}
      explorer={starkscan}
      autoConnect
    >
      {children}
    </StarknetConfig>
  );
}

/** Skip Starknet on server (RpcProvider throws "unsupported channel" in Node). Client only: full StarknetConfig. */
function StarknetConnectors({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted || typeof window === "undefined") {
    return <>{children}</>;
  }
  return (
    <StarknetConnectorsClient>
      <StarkzapProvider>{children}</StarkzapProvider>
    </StarknetConnectorsClient>
  );
}

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <StarknetConnectors>{children}</StarknetConnectors>
    </QueryClientProvider>
  );
}
