import {JSX, useEffect, useState} from 'react';

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
            <p>Calc</p>
            {/*TODO -- UI to set states here*/}
        </>
    )
}

export default BlackScholesCalculator;