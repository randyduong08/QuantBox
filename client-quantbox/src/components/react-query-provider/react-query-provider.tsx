"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { JSX } from "react";

const queryClient: QueryClient = new QueryClient();

export default function ReactQueryClientProvider({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </>
  );
}
