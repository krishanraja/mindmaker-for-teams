import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { ExecutivePulse } from "@/components/exec-teams/ExecutivePulse";
import { FacilitatorDashboard } from "./pages/FacilitatorDashboard";
import { CreateWorkshop } from "./pages/CreateWorkshop";
import { MobileBottleneck } from "./pages/MobileBottleneck";
import { MobileEffortlessMap } from "./pages/MobileEffortlessMap";
import { MobileDotVoting } from "./pages/MobileDotVoting";
import { MobilePreWorkshop } from "./pages/MobilePreWorkshop";
import { MobileRegistration } from "./pages/MobileRegistration";
import { MobileWorkingGroup } from "./pages/MobileWorkingGroup";
import FacilitatorLogin from "./pages/FacilitatorLogin";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="fractionl-ui-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/exec-pulse/:intakeId/:emailHash" element={<ExecutivePulse />} />
              <Route path="/facilitator-login" element={<FacilitatorLogin />} />
              <Route 
                path="/facilitator/:workshopId" 
                element={
                  <ProtectedRoute>
                    <FacilitatorDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/create-workshop" 
                element={
                  <ProtectedRoute>
                    <CreateWorkshop />
                  </ProtectedRoute>
                } 
              />
              <Route path="/mobile/bottleneck/:workshopId" element={<MobileBottleneck />} />
              <Route path="/mobile/effortless-map/:workshopId" element={<MobileEffortlessMap />} />
              <Route path="/mobile/voting/:workshopId" element={<MobileDotVoting />} />
              <Route path="/mobile/working-group/:workshopId" element={<MobileWorkingGroup />} />
              <Route path="/pre-workshop/:intakeId/:participantHash" element={<MobilePreWorkshop />} />
              <Route path="/mobile-registration/:intakeId" element={<MobileRegistration />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
