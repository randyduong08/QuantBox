"use client";
import React, { useState } from "react";
import {
  ComparisonResult,
  ConvergenceResult,
  MonteCarloResult,
} from "@/types/monte-carlo-models";
import {
  fetchComparison,
  fetchConvergenceAnalysis,
  fetchMonteCarloSimulation,
} from "@/services/monte-carlo-service";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface MonteCarloParams {
  spotPrice: number;
  strikePrice: number;
  timeToExpiry: number;
  riskFreeRate: number;
  volatility: number;
  numSimulations?: number;
}

const MonteCarloSimulator: React.FC = () => {
  const [params, setParams] = useState<MonteCarloParams>({
    spotPrice: 100,
    strikePrice: 100,
    timeToExpiry: 1.0,
    riskFreeRate: 0.05,
    volatility: 0.2,
    numSimulations: 100000,
  });

  const [mcResult, setMcResult] = useState<MonteCarloResult | null>(null);
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [convergence, setConvergence] = useState<ConvergenceResult | null>(
    null,
  );
  const [loading, setLoading] = useState({
    mc: false,
    compare: false,
    convergence: false,
  });

  const runMonteCarloSimulation = async (): Promise<void> => {
    setLoading((prev) => ({ ...prev, mc: true }));
    const result: MonteCarloResult = await fetchMonteCarloSimulation(params);
    setMcResult(result);
    setLoading((prev) => ({ ...prev, mc: false }));
  };

  const runComparison = async (): Promise<void> => {
    setLoading((prev) => ({ ...prev, compare: true }));
    const result: ComparisonResult = await fetchComparison(params);
    setComparison(result);
    setLoading((prev) => ({ ...prev, compare: false }));
  };

  const runConvergenceAnalysis = async (): Promise<void> => {
    setLoading((prev) => ({ ...prev, convergence: true }));
    const result: ConvergenceResult = await fetchConvergenceAnalysis(params);
    setConvergence(result);
    setLoading((prev) => ({ ...prev, convergence: false }));
  };

  return (
    <>
      <div className={"max-w-6xl mx-auto p-6 space-y-8"}>
        <div className={"bg-white rounded-lg shadow-lg p-6"}>
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            Monte Carlo Options Simulator
          </h1>

          {/* inputs container */}
          <div className={"grid grid-cols-2 md:grid-cols-3 gap-4 mb-6"}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Spot Price
              </label>
              <input
                type={"number"}
                value={params.spotPrice}
                onChange={(e) =>
                  setParams({
                    ...params,
                    spotPrice: parseFloat(e.target.value),
                  })
                }
                className={
                  "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                }
              />
            </div>

            <div>
              <label className={"block text-sm font-medium text-gray-700 mb-1"}>
                Strike Price
              </label>
              <input
                type={"number"}
                value={params.strikePrice}
                onChange={(e) =>
                  setParams({
                    ...params,
                    strikePrice: parseFloat(e.target.value),
                  })
                }
                className={
                  "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                }
              />
            </div>

            <div>
              <label className={"block text-sm font-medium text-gray-700 mb-1"}>
                Time to Expiry (years)
              </label>
              <input
                type={"number"}
                step={"0.01"}
                value={params.timeToExpiry}
                onChange={(e) =>
                  setParams({
                    ...params,
                    timeToExpiry: parseFloat(e.target.value),
                  })
                }
                className={
                  "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                }
              />
            </div>

            <div>
              <label className={"block text-sm font-medium text-gray-700 mb-1"}>
                Risk-Free Rate
              </label>
              <input
                type={"number"}
                step={"0.001"}
                value={params.riskFreeRate}
                onChange={(e) =>
                  setParams({
                    ...params,
                    riskFreeRate: parseFloat(e.target.value),
                  })
                }
                className={
                  "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                }
              />
            </div>

            <div>
              <label className={"block text-sm font-medium text-gray-700 mb-1"}>
                Volatility
              </label>
              <input
                type={"number"}
                step={"0.01"}
                value={params.volatility}
                onChange={(e) =>
                  setParams({
                    ...params,
                    volatility: parseFloat(e.target.value),
                  })
                }
                className={
                  "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                }
              />
            </div>

            <div>
              <label className={"block text-sm font-medium text-gray-700 mb-1"}>
                Simulations
              </label>
              <input
                type={"number"}
                value={params.numSimulations}
                onChange={(e) =>
                  setParams({
                    ...params,
                    numSimulations: parseInt(e.target.value),
                  })
                }
                className={
                  "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                }
              />
            </div>
          </div>

          {/*  buttons container */}
          <div className={"flex flex-wrap gap-4 mb-6"}>
            <button
              onClick={runMonteCarloSimulation}
              disabled={loading.mc}
              className={
                "px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              }
            >
              {loading.mc ? "Running..." : "Run Monte Carlo"}
            </button>

            <button
              onClick={runComparison}
              disabled={loading.compare}
              className={
                "px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              }
            >
              {loading.compare ? "Comparing..." : "Compare with Black-Scholes"}
            </button>

            <button
              onClick={runConvergenceAnalysis}
              disabled={loading.convergence}
              className={
                "px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              }
            >
              {loading.convergence ? "Analyzing..." : "Convergence Analysis"}
            </button>
          </div>
        </div>

        {/*  simulation output */}
        {mcResult && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Monte Carlo Results
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-600">
                  Call Price
                </h3>
                <p className="text-2xl font-bold text-blue-600">
                  ${mcResult.call_price.toFixed(4)}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-600">Put Price</h3>
                <p className="text-2xl font-bold text-green-600">
                  ${mcResult.put_price.toFixed(4)}
                </p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-600">
                  Standard Error
                </h3>
                <p className="text-2xl font-bold text-yellow-600">
                  {mcResult.standard_error.toFixed(6)}
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-600">
                  Computation Time
                </h3>
                <p className="text-2xl font-bold text-purple-600">
                  {mcResult.computation_time_ms}ms
                </p>
              </div>
            </div>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-600 mb-2">
                95% Confidence Interval (Call)
              </h3>
              <p className="text-lg">
                [${mcResult.confidence_interval_95[0].toFixed(4)}, $
                {mcResult.confidence_interval_95[1].toFixed(4)}]
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Based on {mcResult.num_simulations.toLocaleString()} simulations
              </p>
            </div>
          </div>
        )}

        {/* comparison output */}
        {comparison && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Monte Carlo vs Black-Scholes Comparison
            </h2>

            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                      Method
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                      Call Price
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                      Put Price
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                      Time (ms)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="px-4 py-2 font-medium">Monte Carlo</td>
                    <td className="px-4 py-2">
                      ${comparison.monte_carlo.call_price.toFixed(4)}
                    </td>
                    <td className="px-4 py-2">
                      ${comparison.monte_carlo.put_price.toFixed(4)}
                    </td>
                    <td className="px-4 py-2">
                      {comparison.monte_carlo.computation_time_ms}
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="px-4 py-2 font-medium">Black-Scholes</td>
                    <td className="px-4 py-2">
                      ${comparison.black_scholes.call_price.toFixed(4)}
                    </td>
                    <td className="px-4 py-2">
                      ${comparison.black_scholes.put_price.toFixed(4)}
                    </td>
                    <td className="px-4 py-2">~1</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-600">
                  Call Price Difference
                </h3>
                <p className="text-lg font-bold text-red-600">
                  ${comparison.differences.call_price_diff.toFixed(6)}(
                  {comparison.differences.call_price_diff_percent.toFixed(3)}%)
                </p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-600">
                  Put Price Difference
                </h3>
                <p className="text-lg font-bold text-red-600">
                  ${comparison.differences.put_price_diff.toFixed(6)}(
                  {comparison.differences.put_price_diff_percent.toFixed(3)}%)
                </p>
              </div>
            </div>
          </div>
        )}

        {/* convergence output */}
        {convergence && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Convergence Analysis
            </h2>

            <div className="mb-4 grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-600">
                  Black-Scholes Reference
                </h3>
                <p className="text-xl font-bold text-blue-600">
                  ${convergence.black_scholes_reference.toFixed(4)}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-600">
                  Final Difference
                </h3>
                <p className="text-xl font-bold text-green-600">
                  ${convergence.final_difference.toFixed(6)}
                </p>
              </div>
            </div>

            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={convergence.convergence_data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="num_simulations"
                    tickFormatter={(value) => `${value / 1000}k`}
                  />
                  <YAxis domain={["dataMin - 0.1", "dataMax + 0.1"]} />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      name === "call_price"
                        ? `${value.toFixed(4)}`
                        : name === "standard_error"
                          ? value.toFixed(6)
                          : `${value}ms`,
                      name === "call_price"
                        ? "Call Price"
                        : name === "standard_error"
                          ? "Standard Error"
                          : "Time",
                    ]}
                    labelFormatter={(label) =>
                      `${label.toLocaleString()} simulations`
                    }
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="call_price"
                    stroke="#2563eb"
                    strokeWidth={2}
                    name="Call Price"
                  />
                  <Line
                    type="monotone"
                    dataKey={convergence.black_scholes_reference}
                    stroke="#dc2626"
                    strokeDasharray="5 5"
                    name="Black-Scholes Reference"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4">
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                Performance Metrics
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={convergence.convergence_data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="num_simulations"
                      tickFormatter={(value) => `${value / 1000}k`}
                    />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number) => [
                        `${value}ms`,
                        "Computation Time",
                      ]}
                      labelFormatter={(label) =>
                        `${label.toLocaleString()} simulations`
                      }
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="time_ms"
                      stroke="#059669"
                      strokeWidth={2}
                      name="Computation Time (ms)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* info container */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            How Monte Carlo Works
          </h2>
          <div className="prose max-w-none">
            <p className="text-gray-600 mb-4">
              Monte Carlo simulation prices options by simulating thousands of
              possible future stock price paths and calculating the average
              payoff. Here&#39;s the process:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-gray-600">
              <li>
                Generate random price paths using geometric Brownian motion
              </li>
              <li>
                Calculate the option payoff for each simulated final price
              </li>
              <li>Average all payoffs and discount to present value</li>
              <li>Estimate confidence intervals using standard error</li>
            </ol>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-800">Key Insights:</h3>
              <ul className="list-disc list-inside mt-2 space-y-1 text-blue-700">
                <li>
                  More simulations = more accurate results but longer
                  computation time
                </li>
                <li>Standard error decreases with √n (law of large numbers)</li>
                <li>
                  Monte Carlo becomes essential for exotic options that
                  Black-Scholes can&#39;t handle
                </li>
                <li>
                  Parallel processing can dramatically speed up computation
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MonteCarloSimulator;
