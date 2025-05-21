"use client";

import React, { JSX, useState, useEffect } from "react";

const ApiTestComponent = (): JSX.Element => {
  const [healthStatus, setHealthStatus] = useState("Checking...");
  const [calculationResult, setCalculationResult] =
    useState("Not yet calculated");

  // effect to check health on component mount
  useEffect(() => {
    const checkHealth = async (): Promise<void> => {
      try {
        const response: Response = await fetch(
          "http://localhost:8080/api/health",
        );
        if (response.ok) {
          setHealthStatus("API is healthy (Status: 200 OK)");
        } else {
          setHealthStatus(
            `API health check failed (Status: ${response.status})`,
          );
        }
      } catch (error) {
        console.log("Error checking API health:", error);
        setHealthStatus("API is unreachable");
      }
    };

    checkHealth().then();
  }, []); // empty arr, runs once on mount

  // func to call the calculation endpoint
  const handleCalculateClick = async () => {
    setCalculationResult("Calculating...");
    try {
      // post request w/ body
      const response: Response = await fetch(
        "http://localhost:8080/api/calculate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ test: 1000 }),
        },
      );

      if (response.ok) {
        const textResult: string = await response.text(); // endpoint returning string
        setCalculationResult(`Calculation successful: "${textResult}"`);
      } else {
        const errorText: string = await response.text();
        setCalculationResult(
          `Calculation failed (Status: ${response.status}): ${errorText}`,
        );
      }
    } catch (error) {
      console.error("Error during calculation:", error);
      setCalculationResult("Error calling calculation endpoint");
    }
  };

  return (
    <>
      <div>
        <h1>Axum Backend Test</h1>
        <p>Health Check Status: {healthStatus}</p>
        <hr />
        <button onClick={handleCalculateClick}>Call Calculate Endpoint</button>
        <p>Calculation Result: {calculationResult}</p>
      </div>
    </>
  );
};

export default ApiTestComponent;
