/**
 * Starknet Sepolia and UI constants.
 * Used for tx links, token addresses, and display helpers.
 */

import { DEPARTMENTS as SEED_DEPARTMENTS } from "./seed";

/** Department options for employee form (re-exported from seed). */
export const DEPARTMENTS = SEED_DEPARTMENTS;

/** Starknet Sepolia ETH token address */
export const ETH_TOKEN_ADDRESS =
  "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";

/** STRK token address (Sepolia) */
export const STRK_TOKEN_ADDRESS =
  "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d";

/** Starkscan explorer base URL (Sepolia) */
export const STARKSCAN_BASE_URL = "https://sepolia.starkscan.co";

export function truncateAddress(addr: string, chars = 4): string {
  if (!addr) return "";
  if (addr.length <= chars * 2 + 2) return addr;
  return `${addr.slice(0, chars + 2)}...${addr.slice(-chars)}`;
}

export function formatETH(amount: number): string {
  return `${amount.toFixed(4)} ETH`;
}

/** True if the hash is a local mock (not a real on-chain tx). */
export function isMockTxHash(hash?: string): boolean {
  return !hash || hash.startsWith("0xMOCK_");
}

/** Starkscan URL for a transaction; null if mock. */
export function getTxUrl(hash: string): string | null {
  if (isMockTxHash(hash)) return null;
  return `${STARKSCAN_BASE_URL}/tx/${hash}`;
}
