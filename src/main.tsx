import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";

import { ThemeProvider } from "@/app/ThemeContext";
import { TooltipProvider } from "./components/ui/tooltip";
import { router } from "@/app/router";
import "@/styles/index.css";
import { Toaster } from "./components/ui/toast";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <TooltipProvider delay={200}>
        <RouterProvider router={router} />
      </TooltipProvider>
      <Toaster />
    </ThemeProvider>
  </StrictMode>,
);
