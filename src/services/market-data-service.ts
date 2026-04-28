import {
  OptionsChainResponse,
  QuoteResponse,
  VolatilitySurface,
} from "@/types/market-data-models";
import { invokeCommand } from "@/services/tauri";

export async function fetchMarketQuote(symbol: string): Promise<QuoteResponse> {
  return invokeCommand<QuoteResponse>("get_market_quote", { symbol });
}

export async function fetchOptionsChain(
  symbol: string,
  expiry?: string,
): Promise<OptionsChainResponse> {
  return invokeCommand<OptionsChainResponse>("get_options_chain", {
    symbol,
    expiry: expiry ?? null,
  });
}

export async function fetchVolatilitySurface(
  symbol: string,
): Promise<VolatilitySurface> {
  return invokeCommand<VolatilitySurface>("get_volatility_surface", { symbol });
}
