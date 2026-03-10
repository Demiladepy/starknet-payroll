export const TONGO_CONFIG = {
  contractAddress: import.meta.env.VITE_TONGO_CONTRACT_ADDRESS || "",
  wrapperAddress: import.meta.env.VITE_TONGO_WRAPPER_ADDRESS || "",
  get isConfigured() {
    return Boolean(this.contractAddress && this.wrapperAddress);
  },
};

export function canUsePrivateTransfer(
  employee: { tongoPublicKey?: string },
  hasSenderKey: boolean
): boolean {
  return TONGO_CONFIG.isConfigured && Boolean(employee.tongoPublicKey) && hasSenderKey;
}
