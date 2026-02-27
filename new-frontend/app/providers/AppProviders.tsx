import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PrivyProvider } from "@privy-io/react-auth";
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
  const appId = import.meta.env.VITE_PRIVY_APP_ID;
  if (!appId) {
    console.warn("VITE_PRIVY_APP_ID is not set; Privy auth may not work.");
  }

  return (
    <QueryClientProvider client={queryClient}>
      <PrivyProvider
        appId={appId ?? ""}
        config={{
          loginMethods: ["email", "wallet"],
          appearance: {
            theme: "light",
            accentColor: "#2563eb",
          },
        }}
      >
        <StarknetConnectors>{children}</StarknetConnectors>
      </PrivyProvider>
    </QueryClientProvider>
  );
}
