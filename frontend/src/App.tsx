import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Landing from "./pages/Landing";
import Planner from "./pages/Planner";
import Transport from "./pages/Transport";
import PlaceAnalysis from "./pages/PlaceAnalysis";
import Reviews from "./pages/Reviews";
import GuardianCard from "./pages/GuardianCard";
import CrimeAnalysis from "./pages/CrimeAnalysis";
import NotFound from "./pages/NotFound";
import Dock from "./components/Dock";

const queryClient = new QueryClient();

const AppContent = () => {
  const location = useLocation();
  const showDock = location.pathname !== "/";

  return (
    <>
      <Toaster />
      <Sonner />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/place-analysis" element={<PlaceAnalysis />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/guardian" element={<GuardianCard />} />
        <Route path="/planner" element={<Planner />} />
        <Route path="/transport" element={<Transport />} />
        <Route path="/crime-analysis" element={<CrimeAnalysis />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {showDock && <Dock />}
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
