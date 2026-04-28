import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { BlackScholesFields, OptionType } from "@/types/black-scholes-fields";

export interface BlackScholesState extends BlackScholesFields {
  setSpotPrice: (spotPrice: number) => void;
  setStrikePrice: (strikePrice: number) => void;
  setTimeToMaturity: (timeToMaturity: number) => void;
  setVolatility: (volatility: number) => void;
  setRiskFreeRate: (riskFreeRate: number) => void;
  setOptionType: (optionType: OptionType) => void;
  setBlackScholesFields: (fields: BlackScholesFields) => void;
}

export const useBlackScholesStore = create<BlackScholesState>()(
  devtools(
    (set) => ({
      spotPrice: null,
      strikePrice: null,
      timeToMaturity: null,
      volatility: null,
      riskFreeRate: null,
      optionType: null,

      setSpotPrice: (spotPrice: number) => set({ spotPrice }),
      setStrikePrice: (strikePrice: number) => set({ strikePrice }),
      setTimeToMaturity: (timeToMaturity: number) => set({ timeToMaturity }),
      setVolatility: (volatility: number) => set({ volatility }),
      setRiskFreeRate: (riskFreeRate: number) => set({ riskFreeRate }),
      setOptionType: (optionType: OptionType) => set({ optionType }),
      setBlackScholesFields: (fields: BlackScholesFields) => set(fields),
    }),
    {
      name: "BlackScholesStore",
    },
  ),
);
