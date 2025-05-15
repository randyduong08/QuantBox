import { create } from 'zustand';
import { BlackScholesFields, OptionType } from "@/types/black-scholes-fields";

interface BlackScholesState extends BlackScholesFields {
    setSpotPrice: (spotPrice: number) => void;
    setStrikePrice: (strikePrice: number) => void;
    setTimeToMaturity: (timeToMaturity: number) => void;
    setVolatility: (volatility: number) => void;
    setRiskFreeRate: (riskFreeRate: number) => void;
    setOptionType: (optionType: OptionType) => void;
    setBlackScholesFields: (fields: BlackScholesFields) => void;
}

export const useBlackScholesStore = create<BlackScholesState>((set) => ({
    spotPrice: 100,
    strikePrice: 100,
    timeToMaturity: 1,
    volatility: 0.20,
    riskFreeRate: 0.05,
    optionType: OptionType.Call,

    setSpotPrice: (spotPrice: number) => set({ spotPrice }),
    setStrikePrice: (strikePrice: number) => set({ strikePrice }),
    setTimeToMaturity: (timeToMaturity: number) => set({ timeToMaturity }),
    setVolatility: (volatility: number) => set({ volatility }),
    setRiskFreeRate: (riskFreeRate: number) => set({ riskFreeRate }),
    setOptionType: (optionType: OptionType) => set({ optionType }),
    setBlackScholesFields: (fields: BlackScholesFields) => set(fields),
}));

