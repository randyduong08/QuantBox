import Head from "next/head";
import { JSX } from "react";
import GreeksCharts from "@/components/greeks-charts/greeks-charts";

export default function GreeksVisualizationPage(): JSX.Element {
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

        <GreeksCharts />
      </div>
    </>
  );
}
