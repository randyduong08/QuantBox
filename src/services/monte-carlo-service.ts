import {
  ComparisonResult,
  ConvergenceResult,
  MonteCarloParams,
  MonteCarloResult,
} from "@/types/monte-carlo-models";
import { invokeCommand } from "@/services/tauri";

function toMonteCarloRequest(input: MonteCarloParams) {
  return {
    spot_price: input.spotPrice,
    strike_price: input.strikePrice,
    time_to_expiry: input.timeToExpiry,
    risk_free_rate: input.riskFreeRate,
    volatility: input.volatility,
    num_simulations: input.numSimulations,
  };
}

export async function fetchMonteCarloSimulation(
  input: MonteCarloParams,
): Promise<MonteCarloResult> {
  return invokeCommand<MonteCarloResult>("run_monte_carlo", {
    req: toMonteCarloRequest(input),
  });
}

export async function fetchMonteCarloSimulationParallel(
  input: MonteCarloParams,
): Promise<MonteCarloResult> {
  return invokeCommand<MonteCarloResult>("run_monte_carlo_parallel", {
    req: toMonteCarloRequest(input),
  });
}

export async function fetchComparison(
  input: MonteCarloParams,
): Promise<ComparisonResult> {
  return invokeCommand<ComparisonResult>("run_monte_carlo_comparison", {
    req: toMonteCarloRequest(input),
  });
}

export async function fetchConvergenceAnalysis(
  input: MonteCarloParams,
): Promise<ConvergenceResult> {
  return invokeCommand<ConvergenceResult>("run_convergence_analysis", {
    req: {
      spot_price: input.spotPrice,
      strike_price: input.strikePrice,
      time_to_expiry: input.timeToExpiry,
      risk_free_rate: input.riskFreeRate,
      volatility: input.volatility,
      max_simulations: 1000000,
      step_size: 50000,
    },
  });
}
