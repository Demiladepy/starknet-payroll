import { useState, useEffect, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  StarknetConfig,
  publicProvider,
  useInjectedConnectors,
} from "@starknet-react/core";
import { sepolia } from "@starknet-react/chains";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60 * 1000 },
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
      provider={publicProvider()}
      connectors={connectors}
      queryClient={queryClient}
    >
      {children}
    </StarknetConfig>
  );
}

/** SSR: StarknetConfig with empty connectors. Client: same with useInjectedConnectors. */
function StarknetConnectors({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <StarknetConfig
        chains={[sepolia]}
        provider={publicProvider()}
        connectors={[]}
        queryClient={queryClient}
      >
        {children}
      </StarknetConfig>
    );
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
