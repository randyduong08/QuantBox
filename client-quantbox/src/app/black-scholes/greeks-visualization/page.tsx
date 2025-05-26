import Head from "next/head";
import { JSX } from "react";
import GreeksCharts from "@/components/greeks-charts/greeks-charts";
import { fetchGreeksPrices } from "@/services/black-scholes-service";
import { BlackScholesFields, OptionType } from "@/types/black-scholes-fields";

export default async function GreeksVisualizationPage(): Promise<JSX.Element> {
  const defaultParams: BlackScholesFields = {
    spotPrice: 100,
    strikePrice: 100,
    riskFreeRate: 0.05,
    volatility: 0.2,
    timeToMaturity: 1,
    optionType: OptionType.Call,
  } as BlackScholesFields;

  const { delta, gamma, rho, theta, vega } =
    await fetchGreeksPrices(defaultParams);

  return (
    <>
      <div className={"bg-gray-900 w-full"}>
        <Head>
          <title>QuantBox - Option Greeks Visualization</title>
          <meta
            name={"description"}
            content={"Interactive visualization of option Greeks"}
          />
          <link rel={"icon"} href={"/favicon.ico"} />
        </Head>

        <GreeksCharts
          initialParams={defaultParams}
          initialDelta={delta}
          initialGamma={gamma}
          initialRho={rho}
          initialTheta={theta}
          initialVega={vega}
        />
      </div>
    </>
  );
}
