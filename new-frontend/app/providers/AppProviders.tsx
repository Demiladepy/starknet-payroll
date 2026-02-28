import { useState, useEffect, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  StarknetConfig,
  jsonRpcProvider,
  useInjectedConnectors,
} from "@starknet-react/core";
import { sepolia } from "@starknet-react/chains";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60 * 1000 },
  },
});

/** Starknet v9 only supports RPC spec 0.9.0 / 0.10.0; publicProvider() uses 0.8.1 and throws. */
const starknetProvider = jsonRpcProvider({
  rpc: (chain) => {
    const rpcs = chain.rpcUrls?.public?.http ?? [];
    const nodeUrl = rpcs[0] ?? "https://starknet-sepolia.public.blastapi.io";
    return { nodeUrl, specVersion: "0.10.0" as const };
  },
});

function StarknetConnectorsClient({ children }: { children: ReactNode }) {
  const { connectors } = useInjectedConnectors({
    recommended: [],
    includeRecommended: "onlyIfNoConnectors",
  });

  return (
    <StarknetConfig
      chains={[sepolia]}
      provider={starknetProvider}
      connectors={connectors}
      queryClient={queryClient}
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
  return <StarknetConnectorsClient>{children}</StarknetConnectorsClient>;
}

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <StarknetConnectors>{children}</StarknetConnectors>
    </QueryClientProvider>
  );
}
