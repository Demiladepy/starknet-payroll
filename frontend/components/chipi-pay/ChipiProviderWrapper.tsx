"use client";

import { chipiConfig } from "@/lib/chipi-pay";

/**
 * Wraps children with Chipi SDK provider when NEXT_PUBLIC_CHIPI_API_KEY is set.
 * Real SDK: gasless transfers, create wallet, withdraw. Get API key from https://dashboard.chipipay.com
 */
export function ChipiProviderWrapper({ children }: { children: React.ReactNode }) {
  if (!chipiConfig.isConfigured()) {
    return <>{children}</>;
  }

  try {
    const sdk = require("@chipi-pay/chipi-sdk");
    const Provider = sdk.ChipiProvider ?? sdk.default?.ChipiProvider ?? sdk.default;
    if (!Provider) return <>{children}</>;

    const apiKey = process.env.NEXT_PUBLIC_CHIPI_API_KEY!;
    const rpcUrl = process.env.NEXT_PUBLIC_STARKNET_RPC_URL || "https://starknet-sepolia.public.blastapi.io";
    const network = process.env.NEXT_PUBLIC_STARKNET_NETWORK || "sepolia";

    return (
      <Provider
        config={{
          apiKey,
          rpcUrl,
          network,
        }}
      >
        {children}
      </Provider>
    );
  } catch {
    return <>{children}</>;
  }
}
