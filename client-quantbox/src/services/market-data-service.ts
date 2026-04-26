import {
  OptionsChainResponse,
  QuoteResponse,
  VolatilitySurface,
} from "@/types/market-data-models";

const API_BASE_URL = "http://localhost:8080/api/market";

async function fetchJson<T>(url: string, errorMessage: string): Promise<T> {
  const response: Response = await fetch(url);

  if (!response.ok) {
    throw new Error(errorMessage);
  }

  return response.json();
}

export async function fetchMarketQuote(symbol: string): Promise<QuoteResponse> {
  return fetchJson<QuoteResponse>(
    `${API_BASE_URL}/quote/${symbol}`,
    "Failed to fetch market quote",
  );
}

export async function fetchOptionsChain(
  symbol: string,
  expiry?: string,
): Promise<OptionsChainResponse> {
  const params = new URLSearchParams();

  if (expiry) {
    params.set("expiry", expiry);
  }

  const query = params.toString();

  return fetchJson<OptionsChainResponse>(
    `${API_BASE_URL}/options/${symbol}${query ? `?${query}` : ""}`,
    "Failed to fetch options chain",
  );
}

export async function fetchVolatilitySurface(
  symbol: string,
): Promise<VolatilitySurface> {
  return fetchJson<VolatilitySurface>(
    `${API_BASE_URL}/volatility-surface/${symbol}`,
    "Failed to fetch volatility surface",
  );
}
