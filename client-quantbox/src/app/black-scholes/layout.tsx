import React from "react";
import Link from 'next/link';

export default function BlackScholesLayout({children}: {children: React.ReactNode}) {
    return (
        <>
            <header className={"py-4 px-6 bg-gray-800"}>
                <nav className={"flex items-center justify-between"}>
                    <div className={"flex items-center"}>
                        <h1 className="text-xl font-bold text-white">📊 QuantBox</h1>
                        <div className="ml-8 hidden md:flex space-x-4">
                            <Link
                                href={"/black-scholes/options-calculator"}
                                className={"text-gray-400 hover:text-white"}
                            >
                                Black-Scholes
                            </Link>
                            <Link
                                href={"/black-scholes/greeks-visualization"}
                                className={"text-gray-400 hover:text-white"}
                            >
                                Greeks
                            </Link>
                            <Link
                                href={"/black-scholes/heatmaps-visualization"}
                                className={"text-gray-400 hover:text-white"}
                            >
                                Heatmaps
                            </Link>
                        </div>
                    </div>
                    <div>
                    </div>
                </nav>
            </header>
            {children}
            <footer className={"py-6 px-4 bg-gray-800 text-center text-gray-400"}>
                <p>QuantBox - A Learning + Simulation Toolkit for Options</p>
            </footer>
        </>
    )
}