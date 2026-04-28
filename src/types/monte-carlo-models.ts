export interface MonteCarloParams {
  spotPrice: number;
  strikePrice: number;
  timeToExpiry: number;
  riskFreeRate: number;
  volatility: number;
  numSimulations?: number;
}

export interface MonteCarloResult {
  call_price: number;
  put_price: number;
  standard_error: number;
  confidence_interval_95: [number, number];
  num_simulations: number;
  computation_time_ms: number;
}

export interface ComparisonResult {
  monte_carlo: MonteCarloResult;
  black_scholes: {
    call_price: number;
    put_price: number;
  };
  differences: {
    call_price_diff: number;
    put_price_diff: number;
    call_price_diff_percent: number;
    put_price_diff_percent: number;
  };
}

export interface ConvergencePoint {
  num_simulations: number;
  call_price: number;
  standard_error: number;
  time_ms: number;
}

export interface ConvergenceResult {
  convergence_data: ConvergencePoint[];
  black_scholes_reference: number;
  final_difference: number;
}
