
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import RootLayout from "./components/layout/RootLayout";
import VoterLayout from "./components/layout/VoterLayout";
import AdminLayout from "./components/layout/AdminLayout";
import { AuthProvider } from "./contexts/AuthContext";
import { ElectionProvider } from "./contexts/ElectionContext";
import { VoterProvider } from "./contexts/VoterContext";
import { SupportProvider } from "./contexts/SupportContext";

// Auth page
import Auth from "./pages/auth/Auth";
import Index from "./pages/Index";

// Voter pages
import VoterDashboard from "./pages/voter/VoterDashboard";
import VoterProfile from "./pages/voter/VoterProfile";
import ElectionsList from "./pages/voter/ElectionsList";
import ElectionDetail from "./pages/voter/ElectionDetail";
import VotingHistory from "./pages/voter/VotingHistory";
import VoterSettings from "./pages/voter/VoterSettings";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import VoterManagement from "./pages/admin/VoterManagement";
import ElectionManagement from "./pages/admin/ElectionManagement";
import CreateElection from "./pages/admin/CreateElection";
import ActivityLogs from "./pages/admin/ActivityLogs";
import AdminSettings from "./pages/admin/AdminSettings";

// Not found page
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ElectionProvider>
        <VoterProvider>
          <SupportProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route element={<RootLayout />}>
                    <Route path="/" element={<Index />} />
                    <Route path="/auth" element={<Auth />} />
                    
                    {/* Voter Routes - Protected */}
                    <Route path="/voter" element={<VoterLayout />}>
                      <Route index element={<VoterDashboard />} />
                      <Route path="profile" element={<VoterProfile />} />
                      <Route path="elections" element={<ElectionsList />} />
                      <Route path="elections/:id" element={<ElectionDetail />} />
                      <Route path="history" element={<VotingHistory />} />
                      <Route path="settings" element={<VoterSettings />} />
                    </Route>
                    
                    {/* Admin Routes - Protected */}
                    <Route path="/admin" element={<AdminLayout />}>
                      <Route index element={<AdminDashboard />} />
                      <Route path="voters" element={<VoterManagement />} />
                      <Route path="elections" element={<ElectionManagement />} />
                      <Route path="elections/new" element={<CreateElection />} />
                      <Route path="elections/edit/:id" element={<CreateElection />} />
                      <Route path="activity-logs" element={<ActivityLogs />} />
                      <Route path="settings" element={<AdminSettings />} />
                    </Route>
                    
                    {/* Catch-all route for 404 */}
                    <Route path="*" element={<NotFound />} />
                  </Route>
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </SupportProvider>
        </VoterProvider>
      </ElectionProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
