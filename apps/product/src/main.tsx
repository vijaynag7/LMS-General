import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import "./index.css";
import App from "./App.tsx";
import { queryClient } from "@/lib/query-client";
import { TenantProvider } from "@/hooks/useTenant";
import { AuthProvider } from "@/hooks/useAuth";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TenantProvider>
          <AuthProvider>
            <App />
            <Toaster richColors position="top-right" />
          </AuthProvider>
        </TenantProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
