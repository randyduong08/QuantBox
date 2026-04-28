import OptionsHeatmap from "@/components/options-heatmap/options-heatmap";
import { BlackScholesFields, OptionType } from "@/types/black-scholes-fields";

export default function HeatmapsVisualizationPage() {
  const defaultParams: BlackScholesFields = {
    spotPrice: 100,
    strikePrice: 100,
    riskFreeRate: 0.05,
    volatility: 0.2,
    timeToMaturity: 1,
    optionType: OptionType.Call,
  };

  return (
    <div className={"bg-gray-900 w-full"}>
      <OptionsHeatmap initialParams={defaultParams} />
    </div>
  );
}
