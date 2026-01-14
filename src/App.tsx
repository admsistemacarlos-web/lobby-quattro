import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import Profile from "./pages/Profile";
import CorretorLanding from "./pages/CorretorLanding";
import CorretorDashboard from "./pages/CorretorDashboard";
import CorretorOnboarding from "./pages/CorretorOnboarding";
import Planos from "./pages/Planos";
import UpgradePlano from "./pages/UpgradePlano";
import CrmKanban from "./pages/CrmKanban";
import NotFound from "./pages/NotFound";
import Clients from "./pages/Clients";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/clients" element={<Clients />} />
            <Route path="/" element={<Navigate to="/auth" replace />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/planos" element={<Planos />} />
            <Route path="/upgrade" element={<UpgradePlano />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/dashboard/:corretorId?" element={<CorretorDashboard />} />
            <Route path="/crm" element={<CrmKanban />} />
            <Route path="/convite/:token" element={<CorretorOnboarding />} />
            <Route path="/c/:slug" element={<CorretorLanding />} />
            <Route path="/c/:slug/:anuncioSlug" element={<CorretorLanding />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
