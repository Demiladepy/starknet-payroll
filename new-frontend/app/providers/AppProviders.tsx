import React from "react";
import { sepolia } from "@starknet-react/chains";
import {
  StarknetConfig, useInjectedConnectors,
  argent, braavos, voyager, jsonRpcProvider,
} from "@starknet-react/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StarkzapProvider } from "../contexts/StarkzapContext";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 2, staleTime: 30_000 } },
});

function rpc() {
  return {
    nodeUrl: import.meta.env.VITE_STARKNET_RPC_URL || "https://starknet-sepolia.public.blastapi.io",
  };
}

function StarknetProviders({ children }: { children: React.ReactNode }) {
  const { connectors } = useInjectedConnectors({
    recommended: [argent(), braavos()],
    includeRecommended: "onlyIfNoConnectors",
  });
  return (
    <StarknetConfig
      chains={[sepolia]}
      provider={jsonRpcProvider({ rpc })}
      connectors={connectors}
      explorer={voyager}
      autoConnect
    >
      <StarkzapProvider>{children}</StarkzapProvider>
    </StarknetConfig>
  );
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <StarknetProviders>{children}</StarknetProviders>
    </QueryClientProvider>
  );
}
