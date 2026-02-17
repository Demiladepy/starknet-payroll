/**
 * Chipi Pay: real @chipi-pay/chipi-sdk when configured (NEXT_PUBLIC_CHIPI_API_KEY),
 * plus fallbacks for QR / off-ramp when those are not in the SDK.
 */

export interface QRPaymentConfig {
  amount: number;
  currency: string;
  description?: string;
}

export interface OffRampConfig {
  amount: number;
  currency: string;
  bankAccount: string;
}

export const chipiConfig = {
  isConfigured: (): boolean =>
    typeof process !== "undefined" && !!process.env.NEXT_PUBLIC_CHIPI_API_KEY,
};

/** Mock QR / off-ramp (SDK focuses on wallet + transfer/withdraw). Replace with real Chipi APIs when available. */
export const chipiPayService = {
  async initiateQRPayment(config: QRPaymentConfig): Promise<string> {
    await new Promise((r) => setTimeout(r, 300));
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=chipi-pay-${config.amount}-${config.currency}`;
  },

  async initiateOffRamp(config: OffRampConfig): Promise<string> {
    await new Promise((r) => setTimeout(r, 300));
    return `tx-${Date.now()}-${config.amount}-${config.currency}`;
  },

  async getPaymentStatus(transactionId: string): Promise<{
    status: "pending" | "completed" | "failed";
    amount: number;
    currency: string;
  }> {
    await new Promise((r) => setTimeout(r, 200));
    return { status: "completed", amount: 0, currency: "USDC" };
  },
};
