/**
 * black-scholes option pricing model utilities
 *
 * file contains functions for option pricing and greeks calculations
 * based on the black-scholes model
 */

/**
 * standard normal cumulative distribution function
 * approximation of the cumulative normal distribution
 *
 * @param {number} x - the upper limit of integration
 * @returns {number} - the probability
 */
export function normalCDF(x: number) {
    const t: number = 1 / (1 + 0.2316419 * Math.abs(x));
    const d: number = 0.3989423 * Math.exp((-x * x) / 2);
    let p: number= d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    if (x > 0) p = 1 - p;
    return p;
}

/**
 * Standard normal probability density function
 *
 * @param {number} x - the value at which to evaluate the function
 * @returns {number} - the probability density
 */
export function normalPDF(x: number): number {
    return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

/**
 * calculate d1 parameter for black-scholes
 * @param {number} S - spot price
 * @param {number} K - strike price
 * @param {number} r - risk-free interest rate
 * @param {number} v - volatility (sigma)
 * @param {number} T - time to maturity in years
 * @returns {number} - the d1 value
 */
export function calculateD1(S: number, K: number, r: number, v: number, T: number): number {
    return (Math.log(S / K) + (r + 0.5 * v * v) * T) / (v * Math.sqrt(T));
}

/**
 * calculate d2 parameter for black-scholes
 *
 * @param {number} d1 - the value of d1
 * @param {number} v - volatility (sigma)
 * @param {number} T - time to maturity in years
 * @returns {number} - the d2 value
 */
export function calculateD2(d1: number, v: number, T: number): number {
    return d1 - v * Math.sqrt(T);
}

//TODO -- FINISH THIS MAY 17