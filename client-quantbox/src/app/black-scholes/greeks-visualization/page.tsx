'use client';

import {useState, useEffect, JSX} from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function GreeksVisualizationPage(defaultParams = {} ): JSX.Element {
    // default parameters for black-scholes model
    const [params, setParams] = useState({
        spotPrice: defaultParams.spotPrice || 100,
        strikePrice: defaultParams.strikePrice || 100,
        timeToMaturity: defaultParams.timeToMaturity || 1.0,
        volatility: defaultParams.volatility || 0.25,
        riskFreeRate: defaultParams.riskFreeRate || 0.05,
        optionType: defaultParams.optionType || 'call'
    });

    // state for chart data
    const [greeksData, setGreeksData] = useState([]);

    // calculate greeks for different spot prices
    const calculateGreeksData = () => {
        const { strikePrice, timeToMaturity, volatility, riskFreeRate, optionType } = params;
        const priceRange = strikePrice * 0.5; // 50% range
        const minPrice = strikePrice - priceRange;
        const maxPrice = strikePrice + priceRange;
        const steps = 100;
        const stepSize = (maxPrice - minPrice) / steps;

        const newData = [];

        for (let i = 0; i <= steps; i++) {
            const spotPrice = minPrice + i * stepSize;
            const greeks = calculateGreeks(spotPrice, strikePrice, riskFreeRate, volatility, timeToMaturity, optionType);

            newData.push({
               spotPrice,
               delta: greeks.delta,
               gamma: greeks.gamma,
               theta: greeks.theta,
               vega: greeks.vega,
               rho: greeks.rho
            });
        }

        setGreeksData(newData);
    };

    // calculate greeks based on black-scholes model
    const calculateGreeks = (S: number, K: number, r: number, v: number, T: number, type: string) => {
        if (T <= 0 || v <= 0) {
            return {
                delta: 0,
                gamma: 0,
                theta: 0,
                vega: 0,
                rho: 0
            };
        }

        // calculate d1 and d2
        const d1: number = (Math.log(S / K) + (r + 0.5 * v * v) * T) / (v * Math.sqrt(T));
        const d2: number = d1 - v * Math.sqrt(T);

        // standard normal CDF
        const cdf = (x: number) => {
            const t: number = 1.0 / (1.0 + 0.2316419 * Math.abs(x));
            const d: number = 0.3989423 * Math.exp(-x * x / 2);
            let p: number = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
            if (x > 0) p = 1 - p;
            return p;
        };

        // standard normal PDF
        const pdf = (x: number) => {
            return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
        };

        // greeks calculations
        const delta: number = type === 'call'
            ? 1 - cdf(-d1)
            : cdf(-d1) - 1;

        const gamma: number = pdf(d1) / (S * v * Math.sqrt(T));

        const theta: number = type === 'call'
            ? (-S * pdf(d1) * v / (2 * Math.sqrt(T)) - r * K * Math.exp(-r * T) * (1 - cdf(-d2))) / 365
            : (-S * pdf(d1) * v / (2 * Math.sqrt(T)) + r * K * Math.exp(-r * T) * cdf(-d2)) / 365;

        const vega: number = S * Math.sqrt(T) * pdf(d1) / 100;

        const rho: number = type === 'call'
            ? K * T * Math.exp(-r * T) * (1 - cdf(-d2)) / 100
            : -K * T * Math.exp(-r * T) * cdf(-d2) / 100;

        return {
            delta,
            gamma,
            theta,
            vega,
            rho
        };
    };

    // update chart data when params change
    useEffect(() => {
        calculateGreeksData();
    }, [params]);

    // handle parameter changes
    const handleParamChange = (param, value) => {
        setParams({...params, [param]: value});
    };


    return(
        <>
            <div className="bg-gray-900 text-white p-6 rounded-lg shadow-lg w-full">
                <h2 className="text-2xl font-bold mb-6">Option Greeks Visualizer</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                    {/* Option Type */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium">Option Type</label>
                        <select
                            value={params.optionType}
                            onChange={(e) => handleParamChange('optionType', e.target.value)}
                            className="w-full bg-gray-800 rounded px-3 py-2"
                        >
                            <option value="call">Call</option>
                            <option value="put">Put</option>
                        </select>
                    </div>

                    {/* Strike Price */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium">Strike Price</label>
                        <input
                            type="number"
                            value={params.strikePrice}
                            onChange={(e) => handleParamChange('strikePrice', parseFloat(e.target.value))}
                            className="w-full bg-gray-800 rounded px-3 py-2"
                        />
                    </div>

                    {/* Time to Maturity */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium">Time (Years)</label>
                        <input
                            type="number"
                            value={params.timeToMaturity}
                            onChange={(e) => handleParamChange('timeToMaturity', parseFloat(e.target.value))}
                            className="w-full bg-gray-800 rounded px-3 py-2"
                            step="0.1"
                        />
                    </div>

                    {/* Volatility */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium">Volatility (σ)</label>
                        <input
                            type="number"
                            value={params.volatility}
                            onChange={(e) => handleParamChange('volatility', parseFloat(e.target.value))}
                            className="w-full bg-gray-800 rounded px-3 py-2"
                            step="0.01"
                        />
                    </div>

                    {/* Risk-Free Rate */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium">Risk-Free Rate</label>
                        <input
                            type="number"
                            value={params.riskFreeRate}
                            onChange={(e) => handleParamChange('riskFreeRate', parseFloat(e.target.value))}
                            className="w-full bg-gray-800 rounded px-3 py-2"
                            step="0.01"
                        />
                    </div>
                </div>

                {/* Greek Charts */}
                <div className="space-y-8">
                    {/* Delta Chart */}
                    <div className="bg-gray-800 p-4 rounded-lg">
                        <h3 className="text-xl font-medium mb-4">Delta</h3>
                        <p className="text-gray-400 mb-4">Rate of change of option price with respect to the underlying
                            asset price.</p>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={greeksData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#444"/>
                                    <XAxis
                                        dataKey="spotPrice"
                                        tick={{fill: '#ccc'}}
                                        label={{value: 'Spot Price', position: 'insideBottom', fill: '#ccc'}}
                                    />
                                    <YAxis
                                        tick={{fill: '#ccc'}}
                                        label={{value: 'Delta', angle: -90, position: 'insideLeft', fill: '#ccc'}}
                                    />
                                    <Tooltip
                                        formatter={(value) => [value.toFixed(4), 'Delta']}
                                        labelFormatter={(value) => `Spot Price: $${value.toFixed(2)}`}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="delta"
                                        stroke="#4ade80"
                                        dot={false}
                                        strokeWidth={2}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Gamma Chart */}
                    <div className="bg-gray-800 p-4 rounded-lg">
                        <h3 className="text-xl font-medium mb-4">Gamma</h3>
                        <p className="text-gray-400 mb-4">Rate of change of Delta with respect to the underlying asset
                            price.</p>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={greeksData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#444"/>
                                    <XAxis
                                        dataKey="spotPrice"
                                        tick={{fill: '#ccc'}}
                                        label={{value: 'Spot Price', position: 'insideBottom', fill: '#ccc'}}
                                    />
                                    <YAxis
                                        tick={{fill: '#ccc'}}
                                        label={{value: 'Gamma', angle: -90, position: 'insideLeft', fill: '#ccc'}}
                                    />
                                    <Tooltip
                                        formatter={(value) => [value.toFixed(4), 'Gamma']}
                                        labelFormatter={(value) => `Spot Price: $${value.toFixed(2)}`}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="gamma"
                                        stroke="#60a5fa"
                                        dot={false}
                                        strokeWidth={2}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Theta Chart */}
                    <div className="bg-gray-800 p-4 rounded-lg">
                        <h3 className="text-xl font-medium mb-4">Theta</h3>
                        <p className="text-gray-400 mb-4">Rate of change of option price with respect to time (time
                            decay).</p>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={greeksData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#444"/>
                                    <XAxis
                                        dataKey="spotPrice"
                                        tick={{fill: '#ccc'}}
                                        label={{value: 'Spot Price', position: 'insideBottom', fill: '#ccc'}}
                                    />
                                    <YAxis
                                        tick={{fill: '#ccc'}}
                                        label={{
                                            value: 'Theta (daily)',
                                            angle: -90,
                                            position: 'insideLeft',
                                            fill: '#ccc'
                                        }}
                                    />
                                    <Tooltip
                                        formatter={(value) => [`$${value.toFixed(4)}`, 'Theta (daily)']}
                                        labelFormatter={(value) => `Spot Price: $${value.toFixed(2)}`}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="theta"
                                        stroke="#f87171"
                                        dot={false}
                                        strokeWidth={2}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Vega Chart */}
                    <div className="bg-gray-800 p-4 rounded-lg">
                        <h3 className="text-xl font-medium mb-4">Vega</h3>
                        <p className="text-gray-400 mb-4">Sensitivity to volatility changes (per 1% change in
                            volatility).</p>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={greeksData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#444"/>
                                    <XAxis
                                        dataKey="spotPrice"
                                        tick={{fill: '#ccc'}}
                                        label={{value: 'Spot Price', position: 'insideBottom', fill: '#ccc'}}
                                    />
                                    <YAxis
                                        tick={{fill: '#ccc'}}
                                        label={{value: 'Vega', angle: -90, position: 'insideLeft', fill: '#ccc'}}
                                    />
                                    <Tooltip
                                        formatter={(value) => [`$${value.toFixed(4)}`, 'Vega']}
                                        labelFormatter={(value) => `Spot Price: $${value.toFixed(2)}`}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="vega"
                                        stroke="#a78bfa"
                                        dot={false}
                                        strokeWidth={2}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
};