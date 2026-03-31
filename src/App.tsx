import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { useDeepLinks } from "@/hooks/useDeepLinks";
import Index from "./pages/Index";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import History from "./pages/History";
import Today from "./pages/Today";
import Agents from "./pages/Agents";
import Tickets from "./pages/Tickets";
import ChatHistory from "./pages/ChatHistory";
import CommercialTransaction from "./pages/CommercialTransaction";
import Onboarding from "./pages/Onboarding";
import NotFound from "./pages/NotFound";
import BottomTabBar from "./components/BottomTabBar";

const queryClient = new QueryClient();

import { AuthProvider } from "@/providers/AuthProvider";
import { ThemeProvider } from "next-themes";

const AppContent = () => {
  useDeepLinks();

  return (
    <>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/today" element={<Today />} />
        <Route path="/agents" element={<Agents />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/history" element={<History />} />
        <Route path="/tickets" element={<Tickets />} />
        <Route path="/commercial-transaction" element={<CommercialTransaction />} />
        {/* Legacy route — redirects handled by merged History page */}
        <Route path="/chat-history" element={<ChatHistory />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <BottomTabBar />
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <HashRouter>
            <AppContent />
          </HashRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
