'use client';

import {JSX, useEffect, useState} from "react";
import {BlackScholesField, OptionType} from "@/types/black-scholes-fields";
import GreeksFields, {GreeksDataPoint} from "@/types/greeks-fields";
import {calculateGreeks} from "@/lib/black-scholes-utils";
import {CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';
import {useBlackScholesStore} from "@/store/black-scholes-store";

export default function GreeksVisualizationPage(): JSX.Element {
    const blackScholesFields = useBlackScholesStore();

    // state for chart data
    const [greeksData, setGreeksData] = useState<GreeksDataPoint[]>([]);

    // calculate greeks for different spot prices
    const calculateGreeksData = () => {
        const { strikePrice, timeToMaturity, volatility, riskFreeRate, optionType } = blackScholesFields;
        const priceRange = strikePrice * 0.5; // 50% range
        const minPrice = strikePrice - priceRange;
        const maxPrice = strikePrice + priceRange;
        const steps = 100;
        const stepSize = (maxPrice - minPrice) / steps;

        const newData = [];

        for (let i = 0; i <= steps; i++) {
            const spotPrice: number = minPrice + i * stepSize;
            const greeks: GreeksFields = calculateGreeks(spotPrice, strikePrice, riskFreeRate, volatility, timeToMaturity, optionType);

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

    // update chart data when params change
    useEffect(() => {
        calculateGreeksData();
    }, [blackScholesFields]);

    // handle parameter changes
    const handleParamChange = (field: BlackScholesField, value: number | OptionType) => {
        switch (field) {
            case BlackScholesField.StrikePrice:
                useBlackScholesStore.setState({ strikePrice: Number(value)});
                break;
            case BlackScholesField.TimeToMaturity:
                useBlackScholesStore.setState({ timeToMaturity: Number(value) });
                break;
            case BlackScholesField.Volatility:
                useBlackScholesStore.setState({ volatility: Number(value) });
                break;
            case BlackScholesField.RiskFreeRate:
                useBlackScholesStore.setState({ riskFreeRate: Number(value) });
                break;
            case BlackScholesField.OptionType:
                useBlackScholesStore.setState({ optionType: value as OptionType });
                break;
        }
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
                            value={blackScholesFields.optionType}
                            onChange={(e) => handleParamChange(BlackScholesField.OptionType, e.target.value as OptionType)}
                            className="w-full bg-gray-800 rounded px-3 py-2"
                        >
                            <option value={OptionType.Call}>Call</option>
                            <option value={OptionType.Put}>Put</option>
                        </select>
                    </div>

                    {/* Strike Price */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium">Strike Price</label>
                        <input
                            type="number"
                            value={blackScholesFields.strikePrice}
                            onChange={(e) => handleParamChange(BlackScholesField.StrikePrice, parseFloat(e.target.value))}
                            className="w-full bg-gray-800 rounded px-3 py-2"
                        />
                    </div>

                    {/* Time to Maturity */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium">Time (Years)</label>
                        <input
                            type="number"
                            value={blackScholesFields.timeToMaturity}
                            onChange={(e) => handleParamChange(BlackScholesField.TimeToMaturity, parseFloat(e.target.value))}
                            className="w-full bg-gray-800 rounded px-3 py-2"
                            step="0.1"
                        />
                    </div>

                    {/* Volatility */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium">Volatility (σ)</label>
                        <input
                            type="number"
                            value={blackScholesFields.volatility}
                            className="w-full bg-gray-800 rounded px-3 py-2"
                            onChange={(e) => handleParamChange(BlackScholesField.Volatility, parseFloat(e.target.value))}
                            step="0.01"
                        />
                    </div>

                    {/* Risk-Free Rate */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium">Risk-Free Rate</label>
                        <input
                            type="number"
                            value={blackScholesFields.riskFreeRate}
                            onChange={(e) => handleParamChange(BlackScholesField.RiskFreeRate, parseFloat(e.target.value))}
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
                                        formatter={(value: number | string) => {
                                            const numericValue = typeof value === 'number' ? value : parseFloat(value);
                                            return [numericValue.toFixed(4), 'Delta'];
                                        }}
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
                                        formatter={(value: number | string) => {
                                            const numericValue = typeof value === 'number' ? value : parseFloat(value);
                                            return [numericValue.toFixed(4), 'Gamma'];
                                        }}
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
                                        formatter={(value: number | string) => {
                                            const numericValue = typeof value === 'number' ? value: parseFloat(value);
                                            return [`$${numericValue.toFixed(4)}`, 'Theta (daily)'];
                                        }}
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
                                        formatter={(value: number | string) => {
                                            const numericValue = typeof value === 'number' ? value : parseFloat(value);
                                            return [`$${numericValue.toFixed(4)}`, 'Vega'];
                                        }}
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