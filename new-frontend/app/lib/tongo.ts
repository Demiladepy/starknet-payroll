// =============================================================================
// Tongo Protocol Configuration & Integration
// =============================================================================
// Package: @fatsolutions/tongo-sdk
// Docs: https://docs.tongo.cash/
// SDK API (discovered): Account(pk, contractAddress, provider), account.transfer({ amount, to: PubKey, sender }) -> TransferOperation, op.toCalldata() -> Call
// =============================================================================

import type { Call } from "starknet";

// ---------------------------------------------------------------------------
// Config — read from environment
// ---------------------------------------------------------------------------
export const TONGO_CONFIG = {
  contractAddress: import.meta.env.VITE_TONGO_CONTRACT_ADDRESS || "",
  wrapperAddress: import.meta.env.VITE_TONGO_WRAPPER_ADDRESS || "",

  get isConfigured(): boolean {
    return Boolean(this.contractAddress) && Boolean(this.wrapperAddress);
  },
} as const;

// ---------------------------------------------------------------------------
// ETH token address on Starknet (Sepolia and Mainnet)
// ---------------------------------------------------------------------------
export const ETH_TOKEN_ADDRESS =
  "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";

// ---------------------------------------------------------------------------
// Check if a private (Tongo) transfer is possible for a given employee
// ---------------------------------------------------------------------------
export function canUsePrivateTransfer(
  employee: { tongoPublicKey?: string },
  companyPrivateKeyProvided: boolean
): boolean {
  return (
    TONGO_CONFIG.isConfigured &&
    Boolean(employee.tongoPublicKey) &&
    companyPrivateKeyProvided
  );
}

// ---------------------------------------------------------------------------
// Build confidential transfer calldata using @fatsolutions/tongo-sdk
// Account( pk, contractAddress, provider ), account.transfer({ amount, to, sender }), op.toCalldata()
// ---------------------------------------------------------------------------
export async function buildPrivateTransferCalls(params: {
  recipientPublicKey: string;
  amount: bigint;
  senderPrivateKey: string;
  senderAddress: string;
  tokenAddress?: string;
}): Promise<Call[]> {
  const {
    recipientPublicKey,
    amount,
    senderPrivateKey,
    senderAddress,
    tokenAddress = ETH_TOKEN_ADDRESS,
  } = params;

  try {
    const tongoSdk = await import("@fatsolutions/tongo-sdk");
    const { RpcProvider } = await import("starknet");

    const rpcUrl =
      import.meta.env.VITE_STARKNET_RPC_URL ||
      "https://starknet-sepolia.public.blastapi.io";
    const provider = new RpcProvider({ nodeUrl: rpcUrl });

    const account = new tongoSdk.Account(
      senderPrivateKey.startsWith("0x")
        ? BigInt(senderPrivateKey)
        : senderPrivateKey,
      TONGO_CONFIG.contractAddress,
      provider
    );

    const toPubKey = hexToPubKey(tongoSdk, recipientPublicKey);
    const transferOp = await account.transfer({
      amount,
      to: toPubKey,
      sender: senderAddress,
    });

    const call = transferOp.toCalldata();
    return Array.isArray(call) ? call : [call];
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      (error.message?.includes("Cannot find module") ||
        error.message?.includes("Module not found"))
    ) {
      throw new Error(
        "@fatsolutions/tongo-sdk is not installed. Run: npm install @fatsolutions/tongo-sdk"
      );
    }
    throw error;
  }
}

function hexToPubKey(
  tongoSdk: {
    ProjectivePoint: { fromHex: (hex: string) => { toAffine?: () => { x: bigint; y: bigint } } };
    projectivePointToStarkPoint: (p: unknown) => { x: bigint; y: bigint };
  },
  hex: string
): { x: bigint; y: bigint } {
  const normalized = hex.replace(/^0x/i, "").toLowerCase();
  if (!/^[0-9a-f]+$/.test(normalized)) {
    throw new Error("Invalid Tongo public key: must be hex string (e.g. 0x...).");
  }
  const point = tongoSdk.ProjectivePoint.fromHex(normalized.length % 2 ? "0" + normalized : normalized);
  return tongoSdk.projectivePointToStarkPoint(point);
}

// ---------------------------------------------------------------------------
// Validate a Tongo public key format
// ---------------------------------------------------------------------------
export function isValidTongoPublicKey(key: string): boolean {
  if (!key) return false;
  return /^0x[0-9a-fA-F]{1,64}$/.test(key);
}

// ---------------------------------------------------------------------------
// Validate a Tongo private key format (basic check)
// ---------------------------------------------------------------------------
export function isValidTongoPrivateKey(key: string): boolean {
  if (!key) return false;
  return /^0x[0-9a-fA-F]{1,64}$/.test(key);
}

// ---------------------------------------------------------------------------
// Transfer path for UI: tongo (confidential), standard, or none
// ---------------------------------------------------------------------------
export function getTransferPath(
  employee: { tongoPublicKey?: string } | null,
  companyKeyEntered: boolean,
  walletConnected: boolean
): {
  path: "tongo" | "standard" | "none";
  label: string;
  sublabel: string;
  ready: boolean;
  missingItems: string[];
} {
  if (!employee) {
    return {
      path: "none",
      label: "Select an employee",
      sublabel: "",
      ready: false,
      missingItems: ["employee"],
    };
  }

  const missing: string[] = [];
  if (!TONGO_CONFIG.isConfigured) missing.push("Tongo contract not configured in .env");
  if (!employee.tongoPublicKey) missing.push("Employee has no Tongo public key");
  if (!companyKeyEntered) missing.push("Company Tongo private key not entered");
  if (!walletConnected) missing.push("No wallet connected");

  if (missing.length === 0) {
    return {
      path: "tongo",
      label: "Confidential transfer",
      sublabel: "Amount encrypted via Tongo Protocol. Hidden on-chain.",
      ready: true,
      missingItems: [],
    };
  }

  return {
    path: "standard",
    label: "Standard transfer",
    sublabel: "Amount visible on-chain.",
    ready: walletConnected,
    missingItems: missing,
  };
}
