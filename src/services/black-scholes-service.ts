import {
  BlackScholesFields,
  HeatmapResponse,
  OptionPricesResponse,
  OptionType,
} from "@/types/black-scholes-fields";
import GreeksFields from "@/types/greeks-fields";
import { invokeCommand } from "@/services/tauri";

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

export async function fetchOptionPrices(
  input: BlackScholesFields,
): Promise<OptionPricesResponse> {
  const response = await invokeCommand<{
    call_price: number;
    put_price: number;
  }>("calculate_option_prices", { req: toOptionInput(input) });

  return {
    callPrice: response.call_price,
    putPrice: response.put_price,
  };
}

export async function fetchGreeksPrices(
  input: BlackScholesFields,
): Promise<GreeksFields> {
  return invokeCommand<GreeksFields>("calculate_greeks_prices", {
    req: {
      ...toOptionInput(input),
      option_type: input.optionType,
    } as GreeksInput,
  });
}

export async function fetchHeatmapData(
  input: BlackScholesFields,
): Promise<HeatmapResponse> {
  const rawResponse = await invokeCommand<{
    spot_prices: string[];
    volatilities: string[];
    call_data: string[][];
    put_data: string[][];
  }>("generate_heatmap_prices", { req: toOptionInput(input) });

  return {
    spotPrices: rawResponse.spot_prices,
    volatilities: rawResponse.volatilities,
    callData: rawResponse.call_data,
    putData: rawResponse.put_data,
  };
}

function toOptionInput(input: BlackScholesFields): OptionInput {
  return {
    spot_price: input.spotPrice,
    strike_price: input.strikePrice,
    risk_free_rate: input.riskFreeRate,
    volatility: input.volatility,
    time_to_maturity: input.timeToMaturity,
  };
}
