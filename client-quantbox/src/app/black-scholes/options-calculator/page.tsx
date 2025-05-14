import Head from "next/head";
import BlackScholesCalculator from "@/components/black-scholes-calculator/black-scholes-calculator";

export default function BlackScholesPage() {
    // TODO -- WORK ON THIS -- MAKE NAVBAR BETTER, ETC -> IMPLEMENTING AS A SIDEBAR COMPONENT IN QUANTBOX-SIDERBAR, TO BE USED IN GLOBAL LAYOUT.
    // TODO -- CONT... SIDEBAR IS FOR GLOBAL STUFF, NAVBAR WILL BE FOR SPECIFIC SEMANTICALLY-RELATED STUFF
    // TODO -- CURR THING -> SIDEBAR IS BASICALLY DONE, NOW SWITCH HEADER TO MORE STYLISH TOP NAVBAR (WILL DO AFTER IMPLEMENTING OTHER PAGES)
    // TODO -- OTHER PAGES
    return (
        <>
            <div className={"min-h-screen bg-gray-900 w-full"}>
                <Head>
                    <title>QuantBox - Black-Scholes Model</title>
                    <meta name={"description"} content={"Interactive Black-Scholes option pricing calculator"}/>
                    <link rel={"icon"} href={"/favicon.ico"}/>
                </Head>

                <main className={"container mx-auto py-8 px-4"}>
                    <BlackScholesCalculator/>
                </main>
            </div>
        </>
    )
}