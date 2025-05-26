import { BlackScholesFields, OptionType } from "@/types/black-scholes-fields";

interface OptionInput {
  spot_price: number;
  strike_price: number;
  risk_free_rate: number;
  volatility: number;
  time_to_maturity: number;
}

interface GreeksInput extends OptionInput {
  option_type: OptionType;
}

export async function fetchOptionPrices(input: BlackScholesFields) {
  const response: Response = await fetch(
    "http://localhost:8080/api/get-options-prices",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        spot_price: input.spotPrice,
        strike_price: input.strikePrice,
        risk_free_rate: input.riskFreeRate,
        volatility: input.volatility,
        time_to_maturity: input.timeToMaturity,
      } as OptionInput),
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch option prices");
  }

  return response.json();
}

export async function fetchGreeksPrices(input: BlackScholesFields) {
  const response: Response = await fetch(
    "http://localhost:8080/api/get-greeks-prices",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        spot_price: input.spotPrice,
        strike_price: input.strikePrice,
        risk_free_rate: input.riskFreeRate,
        volatility: input.volatility,
        time_to_maturity: input.timeToMaturity,
        option_type: input.optionType,
      } as GreeksInput),
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch greeks prices");
  }

  return response.json();
}
