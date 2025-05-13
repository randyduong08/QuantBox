import Head from "next/head";
import BlackScholesCalculator from "@/components/black-scholes-calculator/black-scholes-calculator";

export default function BlackScholesPage() {
    // TODO -- WORK ON THIS -- MAKE NAVBAR BETTER, ETC -> IMPLEMENTING AS A SIDEBAR COMPONENT IN QUANTBOX-SIDERBAR, TO BE USED IN GLOBAL LAYOUT.
    // TODO -- CONT... SIDEBAR IS FOR GLOBAL STUFF, NAVBAR WILL BE FOR SPECIFIC SEMANTICALLY-RELATED STUFF
    // TODO -- CURR ISSUE -> NO SCROLLBAR WHEN CONTENT EXTENDS PAST VIEWPORT OF MONITOR
    return (
        <>
            <div className={"min-h-screen bg-gray-900 w-full"}>
                <Head>
                    <title>QuantBox - Black-Scholes Model</title>
                    <meta name={"description"} content={"Interactive Black-Scholes option pricing calculator"}/>
                    <link rel={"icon"} href={"/favicon.ico"}/>
                </Head>

                <header className={"py-4 px-6 bg-gray-800"}>
                    <nav className={"flex items-center justify-between"}>
                        <div className={"flex items-center"}>
                            <h1 className="text-xl font-bold text-white">📊 QuantBox</h1>
                            <div className="ml-8 hidden md:flex space-x-4">
                                <a href="#" className="text-white font-medium">Black-Scholes</a>
                                <a href="#" className="text-gray-400 hover:text-white">Greeks</a>
                                <a href="#" className="text-gray-400 hover:text-white">Heatmaps</a>
                                <a href="#" className="text-gray-400 hover:text-white">Backtest</a>
                            </div>
                        </div>
                        <div>
                            <button
                                className={"bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"}>Settings
                            </button>
                        </div>
                    </nav>
                </header>

                <main className={"container mx-auto py-8 px-4"}>
                    <BlackScholesCalculator/>
                </main>

                <footer className={"py-6 px-4 bg-gray-800 text-center text-gray-400"}>
                    <p>QuantBox - A Learning + Simulation Toolkit for Options</p>
                </footer>
            </div>
        </>
    )
}