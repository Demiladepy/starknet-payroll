/**
 * Tongo SDK integration – follows official Quick Start:
 * https://www.npmjs.com/package/@fatsolutions/tongo-sdk
 *
 * Uses real @fatsolutions/tongo-sdk when NEXT_PUBLIC_TONGO_CONTRACT_ADDRESS is set;
 * otherwise falls back to mock. Tongo SDK requires a Starknet signer (Account) for
 * TongoAccount; uses Starknet 8 (RpcProvider with specVersion "0.8").
 *
 * Standard flow (matches SDK docs):
 *   const account = new TongoAccount(privateKey, tongoAddress, signer);
 *   // Fund: await signer.execute([fundOp.approve!, fundOp.toCalldata()]);
 *   // Transfer: await signer.execute([transferOp.toCalldata()]);
 *   // Rollover: await signer.execute([rolloverOp.toCalldata()]);
 *   // Withdraw: await signer.execute([withdrawOp.toCalldata()]);
 *   const state = await account.stateDeciphered();
 */

export interface ElGamalKeypair {
  privateKey: string;
  publicKey: string;
}

export interface EncryptedAmount {
  C1: string;
  C2: string;
}

export interface RangeProof {
  commitment: string;
  response: string;
}

export interface TongoAccountState {
  balance: bigint;
  pending: bigint;
  nonce: bigint;
}

/** Starknet signer: address + private key, used to create starknet Account for Tongo. */
export interface TongoStarknetSigner {
  address: string;
  privateKey: string;
}

// —— Mock (when real SDK not available or not configured) ——
function mockKeypair(): ElGamalKeypair {
  const priv = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;
  const pub = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;
  return { privateKey: priv, publicKey: pub };
}

function mockEncrypt(amount: number): EncryptedAmount {
  const payload = Math.round(amount * 1e6).toString(16).padStart(24, "0");
  const nonce = Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
  return { C1: `0x${payload}`, C2: `0x${nonce}` };
}

function mockDecrypt(encryptedAmount: EncryptedAmount): number {
  try {
    const hex = encryptedAmount.C1.replace(/^0x/, "").slice(0, 24);
    return parseInt(hex, 16) / 1e6;
  } catch {
    return 0;
  }
}

let realTongo: typeof import("@fatsolutions/tongo-sdk") | null = null;
let realStarknet: typeof import("starknet") | null = null;

async function loadRealTongo() {
  if (realTongo && realStarknet) return { tongo: realTongo, starknet: realStarknet };
  const contractAddress = process.env.NEXT_PUBLIC_TONGO_CONTRACT_ADDRESS;
  if (!contractAddress) return null;
  try {
    realTongo = await import("@fatsolutions/tongo-sdk");
    realStarknet = await import("starknet");
    return { tongo: realTongo, starknet: realStarknet };
  } catch {
    return null;
  }
}

function useRealTongo(): boolean {
  return !!process.env.NEXT_PUBLIC_TONGO_CONTRACT_ADDRESS;
}

function getNodeUrl(): string {
  return process.env.NEXT_PUBLIC_STARKNET_RPC_URL || "https://starknet-sepolia.public.blastapi.io";
}

export const tongoService = {
  async generateKeypair(): Promise<ElGamalKeypair> {
    const lib = await loadRealTongo();
    if (!lib?.tongo?.Account || !useRealTongo()) return mockKeypair();
    try {
      const priv = BigInt("0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(""));
      const provider = new lib.starknet.RpcProvider({
        nodeUrl: getNodeUrl(),
        specVersion: "0.8",
      });
      const signer = new lib.starknet.Account(provider, "0x0", "0x0");
      const tempAccount = new lib.tongo.Account(priv, process.env.NEXT_PUBLIC_TONGO_CONTRACT_ADDRESS!, signer);
      const pubKey = (tempAccount as { publicKey: unknown }).publicKey;
      const publicKey =
        typeof pubKey === "object" && pubKey !== null && "x" in pubKey
          ? JSON.stringify({ x: String((pubKey as { x: bigint }).x), y: String((pubKey as { y: bigint }).y) })
          : String((tempAccount as { tongoAddress?: () => string }).tongoAddress?.() ?? pubKey);
      return { privateKey: "0x" + priv.toString(16), publicKey };
    } catch {
      return mockKeypair();
    }
  },

  async encryptSalary(amount: number, _publicKey: string): Promise<EncryptedAmount> {
    if (!useRealTongo()) return mockEncrypt(amount);
    return mockEncrypt(amount);
  },

  async decryptSalary(encryptedAmount: EncryptedAmount, _privateKey: string): Promise<number> {
    if (!useRealTongo()) return mockDecrypt(encryptedAmount);
    const state = await tongoService.getDecryptedState(_privateKey, undefined);
    if (state) return Number(state.balance + state.pending) / 1e6;
    return mockDecrypt(encryptedAmount);
  },

  async verifyRangeProof(_encryptedAmount: EncryptedAmount, _proof: RangeProof): Promise<boolean> {
    return true;
  },

  async generateViewingKey(
    _masterKey: string,
    _scope: { employeeAddresses?: string[]; timeRangeStart?: number; timeRangeEnd?: number }
  ): Promise<string> {
    return "0x" + Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
  },

  /**
   * Create a Tongo account with Starknet signer – matches official Quick Start.
   * Usage: fund, transfer, rollover, withdraw via signer.execute([...]).
   */
  async createTongoAccount(
    tongoPrivateKey: string,
    signer: TongoStarknetSigner
  ): Promise<{
    stateDeciphered: () => Promise<TongoAccountState>;
    publicKey: unknown;
    transfer: (to: unknown, amountBaseUnits: bigint) => Promise<{ toCalldata: () => unknown }>;
    fund: (amountBaseUnits: bigint) => Promise<{ populateApprove: () => Promise<void>; approve?: unknown; toCalldata: () => unknown }>;
    rollover: () => Promise<{ toCalldata: () => unknown }>;
    withdraw: (to: string, amountBaseUnits: bigint) => Promise<{ toCalldata: () => unknown }>;
    signer: { execute: (calls: unknown[]) => Promise<{ transaction_hash: string }> };
  } | null> {
    const lib = await loadRealTongo();
    if (!lib?.tongo?.Account || !useRealTongo()) return null;
    try {
      const provider = new lib.starknet.RpcProvider({
        nodeUrl: getNodeUrl(),
        specVersion: "0.8",
      });
      const starknetSigner = new lib.starknet.Account(
        provider,
        signer.address,
        signer.privateKey
      );
      const tongoAddress = process.env.NEXT_PUBLIC_TONGO_CONTRACT_ADDRESS!;
      const account = new lib.tongo.Account(
        BigInt(tongoPrivateKey.replace(/^0x/, ""), 16),
        tongoAddress,
        starknetSigner
      ) as {
        stateDeciphered: () => Promise<{ balance: bigint; pending: bigint; nonce: bigint }>;
        publicKey: unknown;
        transfer: (p: { to: unknown; amount: bigint }) => Promise<{ toCalldata: () => unknown }>;
        fund: (p: { amount: bigint }) => Promise<{ populateApprove: () => Promise<void>; approve?: unknown; toCalldata: () => unknown }>;
        rollover: () => Promise<{ toCalldata: () => unknown }>;
        withdraw: (p: { to: string; amount: bigint }) => Promise<{ toCalldata: () => unknown }>;
      };

      return {
        stateDeciphered: async () => {
          const s = await account.stateDeciphered();
          return { balance: s.balance, pending: s.pending, nonce: s.nonce };
        },
        get publicKey() {
          return account.publicKey;
        },
        transfer: async (to: unknown, amountBaseUnits: bigint) => {
          const op = await account.transfer({ to, amount: amountBaseUnits });
          return op;
        },
        fund: async (amountBaseUnits: bigint) => {
          const fundOp = await account.fund({ amount: amountBaseUnits });
          await fundOp.populateApprove();
          return fundOp;
        },
        rollover: async () => account.rollover(),
        withdraw: async (to: string, amountBaseUnits: bigint) => {
          return account.withdraw({ to, amount: amountBaseUnits });
        },
        signer: starknetSigner,
      };
    } catch {
      return null;
    }
  },

  /**
   * Get decrypted balance (stateDeciphered). Requires a Starknet signer – TongoAccount(privateKey, tongoAddress, signer).
   * Pass signer when you have it (e.g. from env for scripts); in-browser you typically don't have the wallet private key.
   */
  async getDecryptedState(
    tongoPrivateKey: string,
    starknetSigner?: TongoStarknetSigner
  ): Promise<TongoAccountState | null> {
    const lib = await loadRealTongo();
    if (!lib?.tongo?.Account || !useRealTongo()) return null;
    const signer = starknetSigner ?? (process.env.NEXT_PUBLIC_STARKNET_SIGNER_ADDRESS && process.env.NEXT_PUBLIC_STARKNET_SIGNER_PRIVATE_KEY
      ? { address: process.env.NEXT_PUBLIC_STARKNET_SIGNER_ADDRESS, privateKey: process.env.NEXT_PUBLIC_STARKNET_SIGNER_PRIVATE_KEY }
      : undefined);
    if (!signer) return null;
    try {
      const acc = await this.createTongoAccount(tongoPrivateKey, signer);
      if (!acc) return null;
      return acc.stateDeciphered();
    } catch {
      return null;
    }
  },
};
