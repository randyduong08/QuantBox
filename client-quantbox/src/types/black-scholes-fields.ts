export type BlackScholesFields = {
    spotPrice: number;
    strikePrice: number;
    timeToMaturity: number;
    volatility: number;
    riskFreeRate: number;
    optionType: OptionType;
}

export enum BlackScholesField {
    SpotPrice = 'spotPrice',
    StrikePrice = 'strikePrice',
    TimeToMaturity = 'timeToMaturity',
    Volatility = 'volatility',
    RiskFreeRate = 'riskFreeRate',
    OptionType = 'optionType',
}

export enum OptionType {
    Call = 'call',
    Put = 'put',
}

export type BlackScholesHeatmapData = {
    spotPrices: string[];
    volatilities: string[];
    callData: string[][];
    putData: string[][];
}
