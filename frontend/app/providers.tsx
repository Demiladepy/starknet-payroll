"use client";

import { StarknetConfig, publicProvider, useInjectedConnectors, voyager } from "@starknet-react/core";
import { sepolia, mainnet } from "@starknet-react/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

function StarknetProvider({ children }: { children: React.ReactNode }) {
  const { connectors } = useInjectedConnectors({
    recommended: [],
    includeRecommended: "onlyIfNoConnectors",
    order: "random",
  });

  return (
    <StarknetConfig
      chains={[mainnet, sepolia]}
      provider={publicProvider()}
      connectors={connectors}
      explorer={voyager}
    >
      {children}
    </StarknetConfig>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <StarknetProvider>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </StarknetProvider>
  );
}
