import {JSX, useEffect, useState} from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";


const BlackScholesCalculator = (): JSX.Element => {
    // state for input parameters -- useState ~= angular signals
    const [spotPrice, setSpotPrice] = useState(100);
    const [strikePrice, setStrikePrice] = useState(100);
    const [timeToMaturity, setTimeToMaturity] = useState(100);
    const [volatility, setVolatility] = useState(0.25);
    const [riskFreeRate, setRiskFreeRate] = useState(0.05);

    // state for calculated values
    const [callPrice, setCallPrice] = useState(0);
    const [putPrice, setPutPrice] = useState(0);

    // func to calculate black-scholes options prices
    const calculateOptionPrices = (): void => {
        // black-scholes formula
        const d1: number = (Math.log(spotPrice / strikePrice) +
            (riskFreeRate + (volatility * volatility / 2)) * timeToMaturity) /
            (volatility * Math.sqrt(timeToMaturity));

        const d2: number = d1 - (volatility * Math.sqrt(timeToMaturity));

        // standard normal cumulative distribution function (i.e. the N(x), x∈{d1,d2} in the formula)
        // based off python scipy.stats.norm implementation
        const cdf = (x: number): number => {
            const t: number = 1 / (1 + 0.2316419 * Math.abs(x));
            const d: number = 0.3989423 * Math.exp((-x * x) / 2);
            let p: number= d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
            if (x > 0) p = 1 - p;
            return p;
        };

        // calculate call price
        const call: number = (cdf(d1) * spotPrice) - (cdf(d2) * strikePrice * Math.exp(-riskFreeRate * timeToMaturity));

        // calculate put price using put-call parity
        const put: number = call + strikePrice * Math.exp(-riskFreeRate * timeToMaturity) - spotPrice;

        // update state
        setCallPrice(Number(call.toFixed(2)));
        setPutPrice(Number(put.toFixed(2)));
    };

    // recalculate whenever inputs change
    useEffect((): void => {
        calculateOptionPrices();
    }, [spotPrice, strikePrice, timeToMaturity, volatility, riskFreeRate]);

    return (
        <>
            {/*TODO -- UI to set states here*/}
            <Card className={"bg-gray-900 text-white shadow-lg w-full max-w-6xl mx-auto"}>
                <CardHeader>
                    <CardTitle className={"text-3xl font-bold"}>Black-Scholes Pricing Model</CardTitle>
                </CardHeader>
                <CardContent>
                    {/* current asset price */}
                    <div className={"asset-price-section"}>
                        <div className={"space-y-2"}>
                            <label className={"block font-medium"}>Current Asset Price</label>
                            <div className={"relative"}>
                                <input
                                    type={"number"}
                                    value={spotPrice}
                                    onChange={(e) => setSpotPrice(parseFloat(e.target.value))}
                                    className={"w-full bg-gray-800 rounded px-3 py-2 text-right"}
                                />
                            </div>
                        </div>
                        <Slider
                            value={[spotPrice]}
                            min={10}
                            max={200}
                            step={1}
                            onValueChange={(e) => setSpotPrice(e[0])}
                            className={"w-full"}
                        />
                        <div className={"flex justify-between text-xs"}>
                            <span>10.00</span>
                            <span>200.00</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </>
    )
}

export default BlackScholesCalculator;