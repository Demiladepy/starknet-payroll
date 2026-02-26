/**
 * AVNU SDK – swap quotes and execution on Starknet.
 * Docs: https://docs.avnu.fi  |  npm: @avnu/avnu-sdk
 *
 * Usage:
 *   import { getQuotes, executeSwap } from '@avnu/avnu-sdk';
 *   import { parseUnits } from 'ethers';
 *   const quotes = await getQuotes({
 *     sellTokenAddress: AVNU_SEPOLIA_ETH,
 *     buyTokenAddress: AVNU_SEPOLIA_STRK,
 *     sellAmount: parseUnits('0.001', 18),
 *     takerAddress: account.address,
 *     size: 3,
 *   });
 *   const result = await executeSwap({ provider: account, quote: quotes[0], slippage: 0.001 });
 */

export const AVNU_SEPOLIA_ETH =
  "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";
export const AVNU_SEPOLIA_STRK =
  "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d";

export const AVNU_MAINNET_ETH =
  "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";
export const AVNU_MAINNET_STRK =
  "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d";

export { getQuotes, executeSwap } from "@avnu/avnu-sdk";
