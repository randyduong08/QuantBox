import Head from "next/head";
import { JSX } from "react";
import OptionsHeatmap from "@/components/options-heatmap/options-heatmap";
import { fetchHeatmapData } from "@/services/black-scholes-service";
import { BlackScholesFields } from "@/types/black-scholes-fields";

export default async function HeatmapsVisualizationPage(): Promise<JSX.Element> {
  const defaultParams: BlackScholesFields = {
    spotPrice: 100,
    strikePrice: 100,
    riskFreeRate: 0.05,
    volatility: 0.2,
    timeToMaturity: 1,
  } as BlackScholesFields;

  const { spotPrices, volatilities, callData, putData } =
    await fetchHeatmapData(defaultParams);

  console.log("OBJECT: ", spotPrices, volatilities, callData, putData);

  return (
    <>
      <div className={"bg-gray-900 w-full"}>
        <Head>
          <title>QuantBox - Options price Heatmap</title>
          <meta
            name={"description"}
            content={"Heatmap visualization on how option prices fluctuate"}
          />
          <link rel={"icon"} href={"/favicon.ico"} />
        </Head>

        <OptionsHeatmap
          initialParams={defaultParams}
          initialCallData={callData}
          initialPutData={putData}
          initialSpotPrices={spotPrices}
          initialVolatilities={volatilities}
        />
      </div>
    </>
  );
}
