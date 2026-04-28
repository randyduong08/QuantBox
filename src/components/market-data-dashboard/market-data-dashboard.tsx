"use client";

import { JSX, useState } from "react";
import {
  fetchMarketQuote,
  fetchOptionsChain,
  fetchVolatilitySurface,
} from "@/services/market-data-service";
import {
  OptionsChainResponse,
  OptionsContract,
  QuoteResponse,
  VolatilitySurface,
} from "@/types/market-data-models";

const formatNumber = (value: number | null | undefined, digits = 2): string => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "--";
  }

  return value.toFixed(digits);
};

export default function MarketDataDashboard(): JSX.Element {
  const [symbol, setSymbol] = useState<string>("AAPL");
  const [expiry, setExpiry] = useState<string>("");
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [optionsChain, setOptionsChain] =
    useState<OptionsChainResponse | null>(null);
  const [volatilitySurface, setVolatilitySurface] =
    useState<VolatilitySurface | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const normalizedSymbol = symbol.trim().toUpperCase();

  const runRequest = async (
    requestName: string,
    request: () => Promise<void>,
  ): Promise<void> => {
    if (!normalizedSymbol) {
      setError("Enter a ticker symbol first.");
      return;
    }

    setLoading(requestName);
    setError(null);

    try {
      await request();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Market data request failed");
    } finally {
      setLoading(null);
    }
  };

  const loadQuote = (): Promise<void> =>
    runRequest("quote", async () => {
      const response = await fetchMarketQuote(normalizedSymbol);
      setQuote(response);
    });

  const loadOptionsChain = (): Promise<void> =>
    runRequest("options", async () => {
      const response = await fetchOptionsChain(normalizedSymbol, expiry || undefined);
      setOptionsChain(response);
    });

  const loadVolatilitySurface = (): Promise<void> =>
    runRequest("surface", async () => {
      const response = await fetchVolatilitySurface(normalizedSymbol);
      setVolatilitySurface(response);
    });

  const visibleOptions: OptionsContract[] = optionsChain?.options.slice(0, 12) ?? [];

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <section className="rounded-2xl border border-cyan-400/20 bg-slate-900/80 p-6 shadow-2xl shadow-cyan-950/30">
          <p className="mb-2 text-sm uppercase tracking-[0.3em] text-cyan-300">
            Polygon Market Data MVP
          </p>
          <h1 className="mb-3 text-4xl font-bold text-white">
            Market Data Integration
          </h1>
          <p className="max-w-3xl text-slate-300">
            Pull an underlying quote, option chain snapshot, and implied volatility
            surface from the Rust backend. Option chains use Polygon snapshot data
            so IV and Greeks are populated when your API plan returns them.
          </p>
        </section>

        <section className="grid gap-4 rounded-2xl border border-slate-700 bg-slate-900 p-5 md:grid-cols-[1fr_1fr_auto]">
          <label className="flex flex-col gap-2 text-sm text-slate-300">
            Ticker
            <input
              value={symbol}
              onChange={(event) => setSymbol(event.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-lg font-semibold uppercase text-white outline-none focus:border-cyan-400"
              placeholder="AAPL"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm text-slate-300">
            Expiry Filter Optional
            <input
              value={expiry}
              onChange={(event) => setExpiry(event.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-lg text-white outline-none focus:border-cyan-400"
              placeholder="YYYY-MM-DD"
            />
          </label>

          <div className="flex flex-wrap items-end gap-3">
            <button
              onClick={loadQuote}
              disabled={loading !== null}
              className="rounded-lg bg-cyan-400 px-4 py-3 font-semibold text-slate-950 disabled:opacity-50"
            >
              {loading === "quote" ? "Loading..." : "Get Quote"}
            </button>
            <button
              onClick={loadOptionsChain}
              disabled={loading !== null}
              className="rounded-lg bg-indigo-400 px-4 py-3 font-semibold text-slate-950 disabled:opacity-50"
            >
              {loading === "options" ? "Loading..." : "Get Chain"}
            </button>
            <button
              onClick={loadVolatilitySurface}
              disabled={loading !== null}
              className="rounded-lg bg-emerald-400 px-4 py-3 font-semibold text-slate-950 disabled:opacity-50"
            >
              {loading === "surface" ? "Loading..." : "Get Surface"}
            </button>
          </div>
        </section>

        {error && (
          <div className="rounded-xl border border-red-500/40 bg-red-950/50 p-4 text-red-200">
            {error}
          </div>
        )}

        <section className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-700 bg-slate-900 p-5">
            <h2 className="mb-4 text-xl font-bold">Underlying Quote</h2>
            {quote ? (
              <div className="space-y-3 text-sm text-slate-300">
                <Metric label="Symbol" value={quote.quote.symbol} />
                <Metric label="Price" value={`$${formatNumber(quote.quote.price)}`} />
                <Metric label="Bid" value={`$${formatNumber(quote.quote.bid)}`} />
                <Metric label="Ask" value={`$${formatNumber(quote.quote.ask)}`} />
                <Metric label="Volume" value={quote.quote.volume.toLocaleString()} />
                <Metric label="Market Status" value={quote.market_status} />
              </div>
            ) : (
              <EmptyState text="Fetch a quote to verify the stock endpoint." />
            )}
          </div>

          <div className="rounded-2xl border border-slate-700 bg-slate-900 p-5">
            <h2 className="mb-4 text-xl font-bold">Option Chain Summary</h2>
            {optionsChain ? (
              <div className="space-y-3 text-sm text-slate-300">
                <Metric
                  label="Contracts"
                  value={optionsChain.chain_summary.total_contracts.toLocaleString()}
                />
                <Metric
                  label="Strike Range"
                  value={`${formatNumber(optionsChain.chain_summary.strike_range[0])} - ${formatNumber(optionsChain.chain_summary.strike_range[1])}`}
                />
                <Metric
                  label="Avg IV"
                  value={formatNumber(optionsChain.chain_summary.avg_implied_vol, 4)}
                />
                <Metric
                  label="Expiries"
                  value={optionsChain.chain_summary.expiry_dates.length.toString()}
                />
              </div>
            ) : (
              <EmptyState text="Fetch an options chain to inspect snapshot data." />
            )}
          </div>

          <div className="rounded-2xl border border-slate-700 bg-slate-900 p-5">
            <h2 className="mb-4 text-xl font-bold">Volatility Surface</h2>
            {volatilitySurface ? (
              <div className="space-y-3 text-sm text-slate-300">
                <Metric label="Symbol" value={volatilitySurface.underlying_symbol} />
                <Metric label="Spot" value={`$${formatNumber(volatilitySurface.spot_price)}`} />
                <Metric
                  label="IV Points"
                  value={volatilitySurface.points.length.toLocaleString()}
                />
                <Metric
                  label="Risk-Free Rate"
                  value={formatNumber(volatilitySurface.risk_free_rate, 4)}
                />
              </div>
            ) : (
              <EmptyState text="Build a volatility surface from options with IV." />
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-700 bg-slate-900 p-5">
          <h2 className="mb-4 text-xl font-bold">Options Snapshot Preview</h2>
          {visibleOptions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="border-b border-slate-700 text-slate-400">
                  <tr>
                    <th className="py-3 pr-4">Contract</th>
                    <th className="py-3 pr-4">Type</th>
                    <th className="py-3 pr-4">Expiry</th>
                    <th className="py-3 pr-4">Strike</th>
                    <th className="py-3 pr-4">Bid</th>
                    <th className="py-3 pr-4">Ask</th>
                    <th className="py-3 pr-4">Last</th>
                    <th className="py-3 pr-4">IV</th>
                    <th className="py-3 pr-4">Delta</th>
                    <th className="py-3 pr-4">OI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  {visibleOptions.map((option) => (
                    <tr key={option.symbol}>
                      <td className="py-3 pr-4 font-mono text-xs text-cyan-200">
                        {option.symbol}
                      </td>
                      <td className="py-3 pr-4">{option.option_type}</td>
                      <td className="py-3 pr-4">{option.expiration_date}</td>
                      <td className="py-3 pr-4">{formatNumber(option.strike_price)}</td>
                      <td className="py-3 pr-4">{formatNumber(option.bid)}</td>
                      <td className="py-3 pr-4">{formatNumber(option.ask)}</td>
                      <td className="py-3 pr-4">{formatNumber(option.last_price)}</td>
                      <td className="py-3 pr-4">{formatNumber(option.implied_volatility, 4)}</td>
                      <td className="py-3 pr-4">{formatNumber(option.delta, 4)}</td>
                      <td className="py-3 pr-4">
                        {option.open_interest?.toLocaleString() ?? "--"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState text="No chain loaded yet. The first 12 contracts will appear here." />
          )}
        </section>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-2 last:border-b-0">
      <span>{label}</span>
      <span className="font-semibold text-white">{value}</span>
    </div>
  );
}

function EmptyState({ text }: { text: string }): JSX.Element {
  return <p className="text-sm text-slate-400">{text}</p>;
}
