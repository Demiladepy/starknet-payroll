export const ETH_TOKEN_ADDRESS = "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";
export const STRK_TOKEN_ADDRESS = "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d";
export const STARKSCAN_BASE_URL = "https://sepolia.starkscan.co";

export function truncateAddress(addr: string, chars = 4): string {
  if (!addr) return "";
  return `${addr.slice(0, chars + 2)}...${addr.slice(-chars)}`;
}

export function formatETH(amount: number): string {
  return `${amount.toFixed(4)} ETH`;
}

export function isMockTxHash(hash?: string): boolean {
  return !hash || hash.startsWith("0xMOCK_");
}

export function getTxUrl(hash: string): string | null {
  if (isMockTxHash(hash)) return null;
  return `${STARKSCAN_BASE_URL}/tx/${hash}`;
}
