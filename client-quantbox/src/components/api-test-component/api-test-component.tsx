"use client";

import { JSX } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";

const ApiTestComponent = (): JSX.Element => {
  // health check using useQuery (for GET reqs)
  const {
    data: healthStatus,
    isLoading: isHealthLoading,
    error: healthError,
  } = useQuery({
    queryKey: ["healthCheck"], // unique key for this query
    queryFn: async (): Promise<string> => {
      const response: Response = await fetch(
        "http://localhost:8080/api/health",
      );
      if (!response.ok) {
        throw new Error(`health check failed: ${response.status}`);
      }
      return "API is healthy (Status: 200 OK)";
    },
    // optional: refetchInterval: 5000,
  });

  // useMutation for POST/PUT/DELETE reqs
  const {
    mutate: calculatePrices,
    data: calculationResult,
    isPending: isCalculating,
    error: calculationError,
    isSuccess: isCalculationSuccess,
  } = useMutation({
    mutationFn: async (payload) => {
      const response: Response = await fetch(
        "http://localhost:8080/api/calculate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        const errorText: string = await response.text();
        throw new Error(
          `calculation failed: ${response.status} - ${errorText}`,
        );
      }
      return response.text();
    },
    onError: (error: Error): void => {
      console.error("calculation error:", error.message);
    },
    onSuccess: (data: string): void => {
      console.log("calculation successful:", data);
    },
  });

  return (
    <>
      <div>
        <h1>Axum Backend Test</h1>

        {isHealthLoading && <p>Health Check Status: Checking...</p>}
        {healthError && (
          <p>Health Check Status: Error - {healthError.message}</p>
        )}
        {healthStatus && <p>Health Check Status: {healthStatus}</p>}

        <hr />

        <button
          onClick={() => calculatePrices(/* potential payload here */)}
          disabled={isCalculating}
        >
          {isCalculating ? "Calculating..." : "Call Calculate Endpoint"}
        </button>

        {isCalculating && <p>Calculation Result: Calculating...</p>}
        {calculationError && (
          <p>Calculation Result: Error - {calculationError.message}</p>
        )}
        {isCalculationSuccess && (
          <p>Calculation Result: &#34;{calculationResult}&#34;</p>
        )}
      </div>
    </>
  );
};

export default ApiTestComponent;
