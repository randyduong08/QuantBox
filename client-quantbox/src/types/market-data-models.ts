import { OptionType } from "@/types/black-scholes-fields";

export type StockQuote = {
  symbol: string;
  price: number;
  bid: number | null;
  ask: number | null;
  volume: number;
  timestamp: string;
};

export type MarketStatus = "Open" | "Closed" | "PreMarket" | "AfterHours";

export type QuoteResponse = {
  quote: StockQuote;
  market_status: MarketStatus;
};

export type OptionsContract = {
  symbol: string;
  underlying_symbol: string;
  strike_price: number;
  expiration_date: string;
  option_type: OptionType;
  bid: number | null;
  ask: number | null;
  last_price: number | null;
  volume: number | null;
  open_interest: number | null;
  implied_volatility: number | null;
  delta: number | null;
  gamma: number | null;
  theta: number | null;
  vega: number | null;
  updated_at: string;
};

export type OptionChainSummary = {
  total_contracts: number;
  expiry_dates: string[];
  strike_range: [number, number];
  avg_implied_vol: number | null;
};

export type OptionsChainResponse = {
  underlying_quote: StockQuote;
  options: OptionsContract[];
  chain_summary: OptionChainSummary;
};

export type VolatilityPoint = {
  strike: number;
  expiry_days: number;
  implied_volatility: number;
  option_type: OptionType;
};

export type VolatilitySurface = {
  underlying_symbol: string;
  spot_price: number;
  risk_free_rate: number;
  dividend_yield: number;
  surface_date: string;
  points: VolatilityPoint[];
};
