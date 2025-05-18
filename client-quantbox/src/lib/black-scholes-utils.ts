/**
 * black-scholes option pricing model utilities
 *
 * file contains functions for option pricing and greeks calculations
 * based on the black-scholes model
 */

import {OptionType} from "@/types/black-scholes-fields";
import GreeksFields from "@/types/greeks-fields";

/**
 * standard normal cumulative distribution function
 * approximation of the cumulative normal distribution
 * based off python scipy.stats.norm implementation
 * @param {number} x - the upper limit of integration
 * @returns {number} - the probability
 */
export function normalCDF(x: number) {
    const t: number = 1.0 / (1.0 + 0.2316419 * Math.abs(x));
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

/**
 * calculate call option price using black-scholes model
 *
 * @param {number} S - spot price
 * @param {number} K - strike price
 * @param {number} r - risk-free interest rate
 * @param {number} v - volatility (sigma)
 * @param {number} T - time to maturity in years
 * @returns {number} - call option price
 */
export function calculateCallPrice(S: number, K: number, r: number, v: number, T: number): number {
    // special case handling
    if (T <= 0) return Math.max(0, S - K);
    if (v <= 0) return Math.max(0, S - K * Math.exp(-r * T));

    const d1: number = calculateD1(S, K, r, v, T);
    const d2: number = calculateD2(d1, v, T);

    return (normalCDF(d1) * S) - (normalCDF(d2) * K * Math.exp(-r * T));
}

/**
 * calculate put option price using black-scholes model (put-call parity)
 *
 * @param {number} S - spot price
 * @param {number} K - strike price
 * @param {number} r - risk-free interest rate
 * @param {number} v - volatility (sigma)
 * @param {number} T - time to maturity in years
 * @returns {number} - put option price
 */
export function calculatePutPrice(S: number, K: number, r: number, v: number, T: number): number {
    // special case handling
    if (T <= 0) return Math.max(0, K - S);
    if (v <= 0) return Math.max(0, K * Math.exp(-r * T) - S);

    const d1: number = calculateD1(S, K, r, v, T);
    const d2: number = calculateD2(d1, v, T);

    return K * Math.exp(-r * T) * normalCDF(-d2) - S * normalCDF(-d1);
}

/**
 * calculate option greeks
 *
 * @param {number} S - spot price
 * @param {number} K - strike price
 * @param {number} r - risk-free interest rate
 * @param {number} v - volatility (sigma)
 * @param {number} T - time to maturity in years
 * @param {OptionType} type - option type ('call' or 'put')
 */
export function calculateGreeks(S: number, K: number, r: number, v:number, T: number, type: OptionType): GreeksFields {
    // special case handling
    if (T <= 0 || v <= 0) {
        return {
            delta: 0,
            gamma: 0,
            theta: 0,
            vega: 0,
            rho: 0
        } as GreeksFields;
    }

    const d1: number = calculateD1(S, K, r, v, T);
    const d2: number = calculateD2(d1, v, T);
    const pdf: number = normalPDF(d1);

    // rate of change of option price w.r.t underlying asset price
    const delta: number = type === OptionType.Call
        ? 1 - normalCDF(-d1)
        : normalCDF(-d1) - 1;

    // rate of change of delta w.r.t underlying asset price
    const gamma: number = pdf / (S * v * Math.sqrt(T));

    // (daily) rate of change of option price w.r.t time to maturity
    const theta: number = type === OptionType.Call
        ? (-S * pdf * v / (2 * Math.sqrt(T)) - r * K * Math.exp(-r * T) * (1 - normalCDF(-d2))) / 365
        : (-S * pdf * v / (2 * Math.sqrt(T)) + r * K * Math.exp(-r * T) * normalCDF(-d2)) / 365;

    // rate of change of option price w.r.t volatility -- divided by 100 to represent a 1% change in volatility
    const vega: number = S * Math.sqrt(T) * pdf / 100;

    // rate of change of option price w.r.t risk-free interest rate -- divided by 100 to represent a 1% change in interest rate
    const rho: number = type === OptionType.Call
        ? K * T * Math.exp(-r * T) * (1 - normalCDF(-d2)) / 100
        : -K * T * Math.exp(-r * T) * normalCDF(-d2) / 100;

    return {
        delta,
        gamma,
        theta,
        vega,
        rho
    } as GreeksFields;
}