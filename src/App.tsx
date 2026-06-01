import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { motion } from "framer-motion";
import { ShieldX, LogIn } from "lucide-react";
import { AdminLayout } from "./components/layout/AdminLayout";
import { AdminGuard } from "./components/layout/AdminGuard";
import { useAuthStore } from "./store/auth.store";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import UsersPage from "./pages/UsersPage";
import KycPage from "./pages/KycPage";
import CategoriesPage from "./pages/CategoriesPage";
import AuditPage from "./pages/AuditPage";
import TransactionsPage from "./pages/TransactionsPage";
import JobsPage from "./pages/JobsPage";
import FinancePage from "./pages/FinancePage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000, refetchOnWindowFocus: false },
  },
});

function UnauthorizedPage() {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center max-w-md"
      >
        <div className="w-16 h-16 rounded-2xl bg-error/10 flex items-center justify-center mx-auto mb-6">
          <ShieldX className="h-8 w-8 text-error" />
        </div>
        <h1 className="text-3xl font-bold text-text-primary mb-3">Accès refusé</h1>
        <p className="text-text-secondary mb-8">
          Vous n'avez pas les droits d'administration pour accéder à cette
          plateforme.
        </p>
        <button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors shadow-sm shadow-primary/20"
        >
          <LogIn className="h-4 w-4" /> Retour à la connexion
        </button>
      </motion.div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route
            path="/"
            element={
              <AdminGuard>
                <AdminLayout />
              </AdminGuard>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="kyc" element={<KycPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="audit" element={<AuditPage />} />
            <Route path="transactions" element={<TransactionsPage />} />
            <Route path="jobs" element={<JobsPage />} />
            <Route path="finance" element={<FinancePage />} />
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        <Toaster position="top-right" richColors closeButton theme="light" />
      </QueryClientProvider>
    </BrowserRouter>
  );
}
