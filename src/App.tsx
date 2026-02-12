import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Labs from "./pages/Labs";
import LabDetail from "./pages/LabDetail";
import LabBuilder from "./pages/LabBuilder";
import TerminalStandalone from "./pages/TerminalStandalone";
import NotFound from "./pages/NotFound";
import Documentation from "./pages/Documentation";
import ManPage from "./pages/ManPage";

const queryClient = new QueryClient();

// App sets up global providers (React Query, tooltips, toasts) and routes.
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/labs" element={<Labs />} />
          <Route path="/labs/:id" element={<LabDetail />} />
          <Route path="/lab-builder" element={<LabBuilder />} />
          <Route path="/terminal-standalone" element={<TerminalStandalone />} />
          <Route path="/documentation" element={<Documentation />} />
          <Route path="/man-page" element={<ManPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
