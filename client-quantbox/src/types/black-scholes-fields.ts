export type BlackScholesFields = {
    spotPrice: number;
    strikePrice: number;
    timeToMaturity: number;
    volatility: number;
    riskFreeRate: number;
    optionType: OptionType;
}

export enum BlackScholesField {
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