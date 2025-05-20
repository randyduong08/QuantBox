type GreeksFields = {
    delta: number;
    gamma: number;
    theta: number;
    vega: number;
    rho: number;
}

export type GreeksDataPoint = {
    spotPrice: number;
    delta: number;
    gamma: number;
    theta: number;
    vega: number;
    rho: number;
}

export default GreeksFields;