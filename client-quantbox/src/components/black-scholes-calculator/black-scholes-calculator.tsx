'use client'

import {JSX, useEffect, useState} from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { useBlackScholesStore } from "@/store/black-scholes-store";


const BlackScholesCalculator = (): JSX.Element => {
    // state for input parameters -- useState ~= angular signals
    // CORRECTION: now using zustand store (instead of useState) for state
    const {
        spotPrice,
        strikePrice,
        timeToMaturity,
        volatility,
        riskFreeRate,
        setSpotPrice,
        setStrikePrice,
        setTimeToMaturity,
        setVolatility,
        setRiskFreeRate,
    } = useBlackScholesStore();

    // state for calculated values
    const [callPrice, setCallPrice] = useState<number>(0);
    const [putPrice, setPutPrice] = useState<number>(0);

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
            <Card className={"bg-gray-900 text-white shadow-lg w-full max-w-6xl mx-auto"}>
                <CardHeader>
                    <CardTitle className={"text-3xl font-bold"}>Black-Scholes Pricing Model</CardTitle>
                </CardHeader>
                <CardContent className={"grid grid-cols-1 gap-6 mb-8"}>

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

                    {/* strike price */}
                    <div className={"strike-price-section"}>
                        <div className={"space-y-2"}>
                            <label className={"block font-medium"}>Strike Price</label>
                            <div className={"relative"}>
                                <input
                                    type={"number"}
                                    value={strikePrice}
                                    onChange={(e) => setStrikePrice(parseFloat(e.target.value))}
                                    className={"w-full bg-gray-800 rounded px-3 py-2 text-right"}
                                />
                            </div>
                        </div>
                        <Slider
                            value={[strikePrice]}
                            min={10}
                            max={200}
                            step={1}
                            onValueChange={(e) => setStrikePrice(e[0])}
                            className={"w-full"}
                        />
                        <div className={"flex justify-between text-xs"}>
                            <span>10.00</span>
                            <span>200.00</span>
                        </div>
                    </div>

                    {/* time to maturity */}
                    <div className={"time-to-maturity-section"}>
                        <div className={"space-y-2"}>
                            <label className={"block font-medium"}>Time to Maturity (Years)</label>
                            <div className={"relative"}>
                                <input
                                    type={"number"}
                                    value={timeToMaturity}
                                    onChange={(e) => setTimeToMaturity(parseFloat(e.target.value))}
                                    className={"w-full bg-gray-800 rounded px-3 py-2 text-right"}
                                    step={0.1}
                                />
                            </div>
                        </div>
                        <Slider
                            value={[timeToMaturity]}
                            min={0.1}
                            max={3}
                            step={0.1}
                            onValueChange={(e) => setTimeToMaturity(e[0])}
                            className={"w-full"}
                        />
                        <div className={"flex justify-between text-xs"}>
                            <span>0.1</span>
                            <span>3.0</span>
                        </div>
                    </div>

                    {/* volatility */}
                    <div className={"volatility-section"}>
                        <div className={"space-y-2"}>
                            <label className={"block font-medium"}>Volatility (σ)</label>
                            <div className={"relative"}>
                                <input
                                    type={"number"}
                                    value={volatility}
                                    onChange={(e) => setVolatility(parseFloat(e.target.value))}
                                    className={"w-full bg-gray-800 rounded px-3 py-2 text-right"}
                                    step={0.01}
                                />
                            </div>
                        </div>
                        <Slider
                            value={[volatility]}
                            min={0.01}
                            max={1}
                            step={0.01}
                            onValueChange={(e) => setVolatility(e[0])}
                            className={"w-full"}
                        />
                        <div className={"flex justify-between text-xs"}>
                            <span>0.01</span>
                            <span>1.0</span>
                        </div>
                    </div>

                    {/* risk-free rate */}
                    <div className={"risk-free-section"}>
                        <div className={"space-y-2"}>
                            <label className={"block font-medium"}>Risk-Free Interest Rate</label>
                            <div className={"relative"}>
                                <input
                                    type={"number"}
                                    value={riskFreeRate}
                                    onChange={(e) => setRiskFreeRate(parseFloat(e.target.value))}
                                    className={"w-full bg-gray-800 rounded px-3 py-2 text-right"}
                                    step={0.01}
                                />
                            </div>
                        </div>
                        <Slider
                            value={[riskFreeRate]}
                            min={0}
                            max={0.2}
                            step={0.01}
                            onValueChange={(e) => setRiskFreeRate(e[0])}
                            className={"w-full"}
                        />
                        <div className={"flex justify-between text-xs"}>
                            <span>0.00</span>
                            <span>0.20</span>
                        </div>
                    </div>

                    {/* results */}
                    <div className={"grid grid-cols-1 md:grid-cols-2 gap-6"}>
                        {/* call value */}
                        <div className={"bg-green-100 bg-opacity-20 p-6 rounded-lg"}>
                            <h2 className={"text-center text-green-400 mb-2"}>CALL Value</h2>
                            <p className={"text-center text-2xl font-bold text-green-400"}>${callPrice}</p>
                        </div>

                        {/* put value */}
                        <div className={"bg-red-100 bg-opacity-20 p-6 rounded-lg"}>
                            <h2 className={"text-center text-red-300 mb-2"}>PUT Value</h2>
                            <p className={"text-center text-2xl font-bold text-red-300"}>${putPrice}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </>
    )
}

export default BlackScholesCalculator;