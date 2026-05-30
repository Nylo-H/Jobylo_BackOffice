import { Component, type ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AdminLayout } from './components/layout/AdminLayout';
import { AdminGuard } from './components/layout/AdminGuard';
import { AuthInitializer } from './components/layout/AuthInitializer';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UsersListPage from './pages/users/UsersListPage';
import UserDetailPage from './pages/users/UserDetailPage';
import KycListPage from './pages/kyc/KycListPage';
import AuditLogsPage from './pages/audit/AuditLogsPage';
import CategoriesPage from './pages/categories/CategoriesPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
});

class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: { componentStack?: string }) {
    console.error('❌ React Error:', error);
    console.error('Stack:', info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <h2 className="text-2xl font-bold text-text-primary mb-2">
              Une erreur est survenue
            </h2>
            <p className="text-text-secondary mb-4">
              {this.state.error?.message || 'Erreur inattendue.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              Recharger la page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Admin routes - protégées par AdminGuard */}
      <Route path="/admin" element={<AdminGuard />}>
        <Route element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="users" element={<UsersListPage />} />
          <Route path="users/:id" element={<UserDetailPage />} />
          <Route path="kyc" element={<KycListPage />} />
          <Route path="audit" element={<AuditLogsPage />} />
          <Route path="categories" element={<CategoriesPage />} />
        </Route>
      </Route>

      {/* Redirection par défaut */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <AuthInitializer>
            <AppRoutes />
            <Toaster position="top-right" richColors closeButton theme="light" />
          </AuthInitializer>
        </ErrorBoundary>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;