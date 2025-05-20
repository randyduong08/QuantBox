"use client";

import { JSX, useState, useEffect } from "react";
import {
  BlackScholesState,
  useBlackScholesStore,
} from "@/store/black-scholes-store";
import { generateHeatmapData } from "@/lib/black-scholes-utils";
import {
  BlackScholesField,
  BlackScholesHeatmapData,
  OptionType,
} from "@/types/black-scholes-fields";

const OptionsHeatmap = (): JSX.Element => {
  // get state from store
  const blackScholesFields: BlackScholesState = useBlackScholesStore();

  // state for heatmap data
  const [heatmapData, setHeatmapData] = useState<BlackScholesHeatmapData>({
    spotPrices: [],
    volatilities: [],
    callData: [],
    putData: [],
  });

  // generate heatmap data when parameters change
  useEffect(() => {
    const data: BlackScholesHeatmapData = generateHeatmapData(
      blackScholesFields.spotPrice,
      blackScholesFields.strikePrice,
      blackScholesFields.volatility,
      blackScholesFields.riskFreeRate,
      blackScholesFields.timeToMaturity,
    );
    setHeatmapData(data);
  }, [blackScholesFields]);

  // determine cell colour based on option price
  const getCellColour = (price: string, optionType: OptionType) => {
    const maxPrice: number =
      optionType === OptionType.Call
        ? Math.max(...heatmapData.callData.flat().map((p) => parseFloat(p)))
        : Math.max(...heatmapData.putData.flat().map((p) => parseFloat(p)));

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
        useBlackScholesStore.setState({ strikePrice: Number(value) });
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
      case BlackScholesField.SpotPrice:
        useBlackScholesStore.setState({ spotPrice: Number(value) });
    }
  };

  return (
    <>
      <div className={"bg-gray-900 text-white p-6 rounded-lg shadow-lg w-full"}>
        <h2 className={"text-2xl font-bold mb-6"}>Options Price Heatmap</h2>

        <div
          className={
            "grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8"
          }
        >
          {/* spot price input */}
          <div className={"space-y-2"}>
            <label className={"block text-sm font-medium"}>Spot Price</label>
            <input
              type={"number"}
              value={blackScholesFields.spotPrice}
              onChange={(e) =>
                handleParamChange(
                  BlackScholesField.SpotPrice,
                  parseFloat(e.target.value),
                )
              }
              className={"w-full bg-gray-800 rounded px-3 py-2"}
            />
          </div>

          {/* strike price input */}
          <div className={"space-y-2"}>
            <label className={"block text-sm font-medium"}>Strike Price</label>
            <input
              type="number"
              value={blackScholesFields.strikePrice}
              onChange={(e) =>
                handleParamChange(
                  BlackScholesField.StrikePrice,
                  parseFloat(e.target.value),
                )
              }
              className={"w-full bg-gray-800 rounded px-3 py-2"}
            />
          </div>

          {/* time to maturity input */}
          <div className={"space-y-2"}>
            <label className={"block text-sm font-medium"}>Time (Years)</label>
            <input
              type="number"
              value={blackScholesFields.timeToMaturity}
              onChange={(e) =>
                handleParamChange(
                  BlackScholesField.TimeToMaturity,
                  parseFloat(e.target.value),
                )
              }
              className={"w-full bg-gray-800 rounded px-3 py-2"}
              step="0.1"
            />
          </div>

          {/* volatility input */}
          <div className={"space-y-2"}>
            <label className={"block text-sm font-medium"}>
              Volatility (σ)
            </label>
            <input
              type="number"
              value={blackScholesFields.volatility}
              onChange={(e) =>
                handleParamChange(
                  BlackScholesField.Volatility,
                  parseFloat(e.target.value),
                )
              }
              className={"w-full bg-gray-800 rounded px-3 py-2"}
              step="0.01"
            />
          </div>

          {/* risk-free rate input */}
          <div className={"space-y-2"}>
            <label className={"block text-sm font-medium"}>
              Risk-Free Rate
            </label>
            <input
              type="number"
              value={blackScholesFields.riskFreeRate}
              onChange={(e) =>
                handleParamChange(
                  BlackScholesField.RiskFreeRate,
                  parseFloat(e.target.value),
                )
              }
              className={"w-full bg-gray-800 rounded px-3 py-2"}
              step="0.01"
            />
          </div>
        </div>

        <div className={"text-gray-400 mb-4"}>
          <p>
            Explore how option prices fluctuate with varying &#34;Spot Prices
            and Volatility&#34; using interactive heatmap parameters, all while
            maintaining a constant &#34;Strike Price&#34;
          </p>
        </div>

        <div className={"grid grid-cols-1 md:grid-cols-2 gap-8"}>
          {/* call heatmap */}
          <div>
            <h3 className={"text-xl font-medium mb-4"}>Call Price Heatmap</h3>
            <div className={"overflow-auto"}>
              <table className={"min-w-full"}>
                <thead>
                  <tr>
                    <th className={"bg-gray-800 p-2 text-left"}>Spot/Vol</th>
                    {heatmapData.volatilities.map((vol: string, i: number) => (
                      <th
                        key={`vol-${i}`}
                        className={"bg-gray-800 p-2 text-center"}
                      >
                        {vol}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {heatmapData.spotPrices.map((spot: string, i: number) => (
                    <tr key={`spot-${i}`}>
                      <td className={"bg-gray-800 p-2 text-left"}>{spot}</td>
                      {heatmapData.callData[i] &&
                        heatmapData.callData[i].map(
                          (price: string, j: number) => (
                            <td
                              key={`call-${i}-${j}`}
                              className={
                                "p-2 text-center text-gray-900 font-medium"
                              }
                              style={{
                                backgroundColor: getCellColour(
                                  price,
                                  OptionType.Call,
                                ),
                              }}
                            >
                              {price}
                            </td>
                          ),
                        )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* put heatmap */}
          <div>
            <h3 className={"text-xl font-medium mb-4"}>Put Price Heatmap</h3>
            <div className={"overflow-auto"}>
              <table className={"min-w-full"}>
                <thead>
                  <tr>
                    <th className={"bg-gray-800 p-2 text-left"}>Spot/Vol</th>
                    {heatmapData.volatilities.map((vol: string, i: number) => (
                      <th
                        key={`vol-${i}`}
                        className={"bg-gray-800 p-2 text-center"}
                      >
                        {vol}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {heatmapData.spotPrices.map((spot: string, i: number) => (
                    <tr key={`spot-${i}`}>
                      <td className={"bg-gray-800 p-2 text-center"}>{spot}</td>
                      {heatmapData.putData[i] &&
                        heatmapData.putData[i].map(
                          (price: string, j: number) => (
                            <td
                              key={`put-${i}-${j}`}
                              className={
                                "p-2 text-center text-gray-900 font-medium"
                              }
                              style={{
                                backgroundColor: getCellColour(
                                  price,
                                  OptionType.Put,
                                ),
                              }}
                            >
                              {price}
                            </td>
                          ),
                        )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OptionsHeatmap;
