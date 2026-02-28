import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  StarknetConfig,
  publicProvider,
  useInjectedConnectors,
} from "@starknet-react/core";
import { sepolia } from "@starknet-react/chains";
import type { ReactNode } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60 * 1000 },
  },
});

function StarknetConnectors({ children }: { children: ReactNode }) {
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

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <StarknetConnectors>{children}</StarknetConnectors>
    </QueryClientProvider>
  );
}
