import Head from "next/head";
import { JSX } from "react";
import OptionsHeatmap from "@/components/options-heatmap/options-heatmap";

export default function HeatmapsVisualizationPage(): JSX.Element {
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

        <OptionsHeatmap />
      </div>
    </>
  );
}
