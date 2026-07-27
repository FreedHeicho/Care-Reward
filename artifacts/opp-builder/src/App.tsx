import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { initializeAuth } from '@/lib/auth';
import { ProtectedRoute } from '@/components/protected-route';
import { AppLayout } from '@/components/app-layout';
import LoginPage from '@/pages/login';
import DashboardPage from '@/pages/dashboard';
import OpportunitiesPage from '@/pages/opportunities';
import OpportunityNewPage from '@/pages/opportunity-new';
import OpportunityDetailPage from '@/pages/opportunity-detail';
import EmployersPage from '@/pages/employers';
import EmployerConfigsPage from '@/pages/employer-configs';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      
      <Route path="/dashboard">
        <ProtectedRoute>
          <AppLayout>
            <DashboardPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/opportunities" component={() => (
        <ProtectedRoute>
          <AppLayout>
            <OpportunitiesPage />
          </AppLayout>
        </ProtectedRoute>
      )} />

      <Route path="/opportunities/new" component={() => (
        <ProtectedRoute>
          <AppLayout>
            <OpportunityNewPage />
          </AppLayout>
        </ProtectedRoute>
      )} />

      <Route path="/opportunities/:id" component={() => (
        <ProtectedRoute>
          <AppLayout>
            <OpportunityDetailPage />
          </AppLayout>
        </ProtectedRoute>
      )} />

      <Route path="/employers" component={() => (
        <ProtectedRoute>
          <AppLayout>
            <EmployersPage />
          </AppLayout>
        </ProtectedRoute>
      )} />

      <Route path="/employers/:id/configs" component={() => (
        <ProtectedRoute>
          <AppLayout>
            <EmployerConfigsPage />
          </AppLayout>
        </ProtectedRoute>
      )} />

      <Route path="/">
        <ProtectedRoute>
          <AppLayout>
            <DashboardPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    initializeAuth();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
