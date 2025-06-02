import {
  ComparisonResult,
  MonteCarloParams,
  MonteCarloResult,
} from "@/types/monte-carlo-models";

export async function fetchMonteCarloSimulation(
  input: MonteCarloParams,
): Promise<MonteCarloResult> {
  const response: Response = await fetch(
    "http://localhost:8080/api/monte-carlo/get-price",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        spot_price: input.spotPrice,
        strike_price: input.strikePrice,
        time_to_expiry: input.timeToExpiry,
        risk_free_rate: input.riskFreeRate,
        volatility: input.volatility,
        num_simulations: input.numSimulations,
      }),
    },
  );

  if (!response.ok) {
    throw new Error("Error running Monte Carlo simulation");
  }

  return response.json();
}

export async function fetchComparison(
  input: MonteCarloParams,
): Promise<ComparisonResult> {
  const response: Response = await fetch(
    "http://localhost:8080/api/monte-carlo/get-comparison",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        spot_price: input.spotPrice,
        strike_price: input.strikePrice,
        time_to_expiry: input.timeToExpiry,
        risk_free_rate: input.riskFreeRate,
        volatility: input.volatility,
        num_simulations: input.numSimulations,
      }),
    },
  );

  if (!response.ok) {
    throw new Error("Error running comparison");
  }

  return response.json();
}

export async function fetchConvergenceAnalysis(input: MonteCarloParams) {
  const response: Response = await fetch(
    "http://localhost:8080/api/monte-carlo/get-convergence",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        spot_price: input.spotPrice,
        strike_price: input.strikePrice,
        time_to_expiry: input.timeToExpiry,
        risk_free_rate: input.riskFreeRate,
        volatility: input.volatility,
        max_simulations: 1000000,
        step_size: 50000,
      }),
    },
  );

  if (!response.ok) {
    throw new Error("Error running convergence analysis");
  }

  return response.json();
}
