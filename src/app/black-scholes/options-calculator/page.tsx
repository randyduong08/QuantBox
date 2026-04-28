import BlackScholesCalculator from "@/components/black-scholes-calculator/black-scholes-calculator";
import { BlackScholesFields, OptionType } from "@/types/black-scholes-fields";

export default function BlackScholesPage() {
  const defaultParams: BlackScholesFields = {
    spotPrice: 100,
    strikePrice: 100,
    timeToMaturity: 1,
    riskFreeRate: 0.05,
    volatility: 0.2,
    optionType: OptionType.Call,
  };

  return (
    <div className={"bg-gray-900 w-full"}>
      <div className={"container mx-auto py-8 px-4"}>
        <BlackScholesCalculator initialParams={defaultParams} />
      </div>
    </div>
  );
}
