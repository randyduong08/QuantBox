'use client'

import {JSX, useState, useEffect} from "react";
import {BlackScholesState, useBlackScholesStore} from "@/store/black-scholes-store";
import {generateHeatmapData} from "@/lib/black-scholes-utils";
import {BlackScholesField, BlackScholesHeatmapData, OptionType} from "@/types/black-scholes-fields";

const OptionsHeatmap = (): JSX.Element => {

    // get state from store
    const blackScholesFields: BlackScholesState = useBlackScholesStore();

    // state for heatmap data
    const [heatmapData, setHeatmapData] = useState<BlackScholesHeatmapData>({
        spotPrices: [],
        volatilities: [],
        callData: [],
        putData: []
    });

    // generate heatmap data when parameters change
    useEffect(() => {
        const data: BlackScholesHeatmapData = generateHeatmapData(blackScholesFields.spotPrice, blackScholesFields.strikePrice,
            blackScholesFields.volatility, blackScholesFields.riskFreeRate, blackScholesFields.timeToMaturity);
        setHeatmapData(data);
    }, [blackScholesFields]);

    // determine cell colour based on option price
    const getCellColour = (price: string, optionType: OptionType) => {
        const maxPrice: number = optionType === OptionType.Call
            ? Math.max(...heatmapData.callData.flat().map(p => parseFloat(p)))
            : Math.max(...heatmapData.putData.flat().map(p => parseFloat(p)));

        const ratio: number = parseFloat(price) / maxPrice;

        if (optionType === OptionType.Call) {
            // green gradient for calls
            const r: number = Math.floor(54 + (48 - 54) * ratio);
            const g: number = Math.floor(211 + (192 - 211) * ratio);
            const b: number = Math.floor(153 + (80 - 153) * ratio);
            return `rgb(${r}, ${g}, ${b})`;
        } else {
            // red gradient for puts
            const r: number = Math.floor(248 + (239 - 248) * ratio);
            const g: number = Math.floor(113 + (68 - 113) * ratio);
            const b: number = Math.floor(113 + (68 - 113) * ratio);
            return `rgb(${r}, ${g}, ${b})`;
        }
    };

    // handle parameter (user input) changes
    const handleParamChange = (field: BlackScholesField, value: number) => {
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
        }
    };

    // TODO -- FINISH HERE MAY 18
    return(
      <>

      </>
    );
};

export default OptionsHeatmap;