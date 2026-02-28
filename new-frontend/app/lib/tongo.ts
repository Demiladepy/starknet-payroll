/**
 * Tongo integration for private balances and transfers.
 * Uses @fatsolutions/tongo-sdk when VITE_TONGO_CONTRACT_ADDRESS is set;
 * otherwise returns mock/placeholder values so the UI works.
 */

import { contractAddresses } from "./starknet";

const TONGO_ADDRESS = contractAddresses.tongo;

export function getTongoContractAddress(): string | null {
  return TONGO_ADDRESS || null;
}

export function isTongoConfigured(): boolean {
  return !!TONGO_ADDRESS;
}

/** Format small units (e.g. 6 decimals) to display string */
export function formatTongoAmount(value: bigint, decimals = 6): string {
  const div = 10 ** decimals;
  const whole = value / BigInt(div);
  const frac = value % BigInt(div);
  const fracStr = frac.toString().padStart(decimals, "0").slice(0, decimals);
  return fracStr ? `${whole}.${fracStr}` : `${whole}`;
}

export interface TongoDecryptedState {
  balance: bigint;
  pending: bigint;
  nonce: bigint;
}

/**
 * Fetch decrypted balance for the current Tongo account.
 * Returns null if Tongo is not configured or on error (caller can show placeholder).
 * Requires Starknet signer and Tongo private key (ElGamal scalar).
 */
export async function getDecryptedBalance(
  signer: { execute: (calls: unknown[]) => Promise<{ transaction_hash: string }> },
  tongoPrivateKey: string
): Promise<TongoDecryptedState | null> {
  if (!TONGO_ADDRESS) return null;
  try {
    const { Account: TongoAccount } = await import("@fatsolutions/tongo-sdk");
    const tongoAccount = new TongoAccount(
      tongoPrivateKey,
      TONGO_ADDRESS,
      signer as import("starknet").AccountInterface
    );
    const state = await tongoAccount.stateDeciphered();
    return {
      balance: state.balance ?? 0n,
      pending: state.pending ?? 0n,
      nonce: state.nonce ?? 0n,
    };
  } catch {
    return null;
  }
}

/**
 * Build calldata for a Tongo transfer (to be executed with signer.execute).
 * Returns null if Tongo not configured or recipient public key missing.
 */
export async function buildTransferCall(
  senderTongoPrivateKey: string,
  recipientPublicKey: string,
  amount: bigint
): Promise<{ contractAddress: string; entrypoint: string; calldata: string[] } | null> {
  if (!TONGO_ADDRESS) return null;
  try {
    const { Account: TongoAccount } = await import("@fatsolutions/tongo-sdk");
    const tongoAccount = new TongoAccount(
      senderTongoPrivateKey,
      TONGO_ADDRESS,
      null as unknown as import("starknet").AccountInterface
    );
    const op = await tongoAccount.transfer({
      to: recipientPublicKey,
      amount,
    });
    const raw = op.toCalldata();
    if (!raw) return null;
    if (typeof raw === "object" && "contractAddress" in raw) {
      const c = raw as { contractAddress: string; entrypoint: string; calldata?: string[] };
      return {
        contractAddress: c.contractAddress,
        entrypoint: c.entrypoint,
        calldata: Array.isArray(c.calldata) ? c.calldata : [],
      };
    }
    if (Array.isArray(raw)) {
      const [contractAddress, entrypoint, ...rest] = raw as [string, string, ...string[]];
      return { contractAddress, entrypoint, calldata: rest };
    }
    return null;
  } catch {
    return null;
  }
}
