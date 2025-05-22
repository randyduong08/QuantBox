"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { JSX } from "react";
import { QuantboxSidebar } from "@/components/quantbox-sidebar/quantbox-sidebar";

const queryClient: QueryClient = new QueryClient();

export default function ClientLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <div
          className={
            "mx-auto flex w-full flex-1 rounded-md border border-neutral-200 bg-gray-100 md:flex-row " +
            "dark:border-neutral-700 dark:bg-neutral-800 h-screen"
          }
        >
          <QuantboxSidebar />

          <div className={"flex-1 overflow-y-auto"}>{children}</div>
        </div>
      </QueryClientProvider>
    </>
  );
}
