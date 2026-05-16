import { useState, useCallback } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate, useNavigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { FinanceProvider } from "@/contexts/FinanceContext";
import { AppLayout } from "@/components/AppLayout";
import { MobileNav } from "@/components/MobileNav";
import LoadingScreen from "@/components/LoadingScreen";
import Dashboard from "@/pages/Dashboard";
import Transactions from "@/pages/Transactions";
import Goals from "@/pages/Goals";
import Projections from "@/pages/Projections";
import Plans from "@/pages/Plans";
import ProfilePage from "@/pages/ProfilePage";
import Auth from "@/pages/Auth";
import Welcome from "@/pages/Welcome";
import NotFound from "@/pages/NotFound";
import { useFirstAccess } from "@/hooks/useFirstAccess";

const queryClient = new QueryClient();

function ProtectedRoutes() {
  const { user, loading } = useAuth();
  const { isFirstAccess } = useFirstAccess();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && isFirstAccess()) {
      navigate("/bem-vindo", { replace: true });
    }
  }, [user, isFirstAccess, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  return (
    <FinanceProvider>
      <AppLayout />
      <MobileNav />
    </FinanceProvider>
  );
}

function AuthRoute() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return <Auth />;
}

function AppWithLoading() {
  const [showLoading, setShowLoading] = useState(true);

  const handleLoadingComplete = useCallback(() => {
    setShowLoading(false);
  }, []);

  return (
    <>
      {showLoading && <LoadingScreen onComplete={handleLoadingComplete} />}
      <Routes>
        <Route path="/auth" element={<AuthRoute />} />
        <Route path="/bem-vindo" element={<Welcome />} />
        <Route element={<ProtectedRoutes />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/transacoes" element={<Transactions />} />
          <Route path="/metas" element={<Goals />} />
          <Route path="/projecoes" element={<Projections />} />
          <Route path="/planos" element={<Plans />} />
          <Route path="/perfil" element={<ProfilePage />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

const App = () => (
  <div className="dark min-h-screen bg-background text-foreground">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <AppWithLoading />
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </div>
);

export default App;
