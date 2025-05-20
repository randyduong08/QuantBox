import Head from "next/head";
import { JSX } from "react";
import GreeksCharts from "@/components/greeks-charts/greeks-charts";

export default function GreeksVisualizationPage(): JSX.Element {
  return (
    <>
      <Head>
        <title>QuantBox - Option Greeks Visualization</title>
        <meta
          name={"description"}
          content={"Interactive visualization of option Greeks"}
        />
        <link rel={"icon"} href={"/favicon.ico"} />
      </Head>

      <main>
        <GreeksCharts />
      </main>
    </>
  );
}
