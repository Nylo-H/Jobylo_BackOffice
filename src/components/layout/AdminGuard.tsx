import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { Loader } from 'lucide-react';

export function AdminGuard() {
  const { isAuthenticated, isAdmin, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-primary mx-auto flex items-center justify-center animate-pulse">
            <span className="text-white font-bold text-xl">J</span>
          </div>
          <p className="text-text-secondary mt-4">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <h2 className="text-xl font-bold text-text-primary">Accès refusé</h2>
          <p className="text-text-secondary mt-2">
            Vous n'avez pas les droits d'administration.
          </p>
        </div>
      </div>
    );
  }

  return <Outlet />;
}