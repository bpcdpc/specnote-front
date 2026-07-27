import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";

import { ThemeProvider } from "@/app/ThemeContext";
import { TooltipProvider } from "./components/ui/tooltip";
import { router } from "@/app/router";
import "@/styles/index.css";
import { Toaster } from "./components/ui/toast";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/api/queryClient";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider delay={200}>
          <RouterProvider router={router} />
        </TooltipProvider>
        <Toaster />
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>,
);
