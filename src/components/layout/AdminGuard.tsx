import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { accessToken, user } = useAuthStore();

  if (!accessToken) return <Navigate to="/login" replace />;
  if (user?.role !== 'ADMIN') return <Navigate to="/unauthorized" replace />;

  return <>{children}</>;
}