import Head from "next/head";
import BlackScholesCalculator from "@/components/black-scholes-calculator/black-scholes-calculator";
import { BlackScholesFields } from "@/types/black-scholes-fields";
import { fetchOptionPrices } from "@/services/black-scholes-service";

export default async function BlackScholesPage() {
  // TODO -- WORK ON THIS -- MAKE NAVBAR BETTER, ETC -> IMPLEMENTING AS A SIDEBAR COMPONENT IN QUANTBOX-SIDERBAR, TO BE USED IN GLOBAL LAYOUT.
  // TODO -- CONT... SIDEBAR IS FOR GLOBAL STUFF, NAVBAR WILL BE FOR SPECIFIC SEMANTICALLY-RELATED STUFF
  // TODO -- CURR THING -> SIDEBAR IS BASICALLY DONE, NOW SWITCH HEADER TO MORE STYLISH TOP NAVBAR (WILL DO AFTER IMPLEMENTING OTHER PAGES)
  // TODO -- OTHER PAGES

  const defaultParams: BlackScholesFields = {
    spotPrice: 100,
    strikePrice: 100,
    timeToMaturity: 1,
    riskFreeRate: 0.05,
    volatility: 0.2,
  } as BlackScholesFields;

  const { callPrice, putPrice } = await fetchOptionPrices(defaultParams);

  return (
    <>
      <div className={"bg-gray-900 w-full"}>
        <Head>
          <title>QuantBox - Black-Scholes Model</title>
          <meta
            name={"description"}
            content={"Interactive Black-Scholes option pricing calculator"}
          />
          <link rel={"icon"} href={"/favicon.ico"} />
        </Head>

        <div className={"container mx-auto py-8 px-4"}>
          <BlackScholesCalculator
            initialParams={defaultParams}
            initialCallPrice={callPrice}
            initialPutPrice={putPrice}
          />
        </div>
      </div>
    </>
  );
}
