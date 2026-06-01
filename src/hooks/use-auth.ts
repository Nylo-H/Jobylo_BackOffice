import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore } from '../store/auth.store';
import { api } from '../api/client';
import type { LoginResponse, User } from '../types/user';

export function useLogin() {
  const setSession = useAuthStore((s) => s.setSession);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      // 1. Login
      const { data: loginResp } = await api.post<LoginResponse>('/auth/login', { email, password });

      // 2. Récupérer le profil
      const { data: me } = await api.get<User>('/auth/me', {
        headers: { Authorization: `Bearer ${loginResp.accesstoken}` },
      });

      // 3. Stocker la session
      setSession(loginResp.accesstoken, loginResp.refreshtoken, me);

      // 4. Rediriger selon le rôle
      if (me.role === 'ADMIN') {
        navigate('/');
        toast.success('Connecté en tant qu\'administrateur');
      } else {
        navigate('/unauthorized');
        toast.error('Accès réservé aux administrateurs');
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      const msg = axiosErr?.response?.data?.error || 'Email ou mot de passe incorrect';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
}

export function useLogout() {
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  
  return () => {
    logout();
    navigate('/login');
  };
}