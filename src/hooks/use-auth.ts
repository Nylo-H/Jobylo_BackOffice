import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore } from '../store/auth.store';
import { api } from '../api/client';
import type { LoginResponse, MeResponse } from '../types/user';

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      // 1er appel : login
      const { data: loginResp } = await api.post<LoginResponse>('/auth/login', {
        email: data.email,
        password: data.password,
      });

      // Stocker le token immédiatement pour le prochain appel
      setAccessToken(loginResp.accesstoken);

      // 2e appel : récupérer le rôle via /me
      const { data: me } = await api.get<MeResponse>('/auth/me', {
        headers: { Authorization: `Bearer ${loginResp.accesstoken}` },
      });

      return { loginResp, me };
    },
    onSuccess: ({ me }) => {
      const accessToken = useAuthStore.getState().accessToken;
      if (!accessToken) return;
      setAuth(me, accessToken);
      queryClient.invalidateQueries();

      if (me.role === 'ADMIN') {
        navigate('/admin/dashboard');
        toast.success('Connecté en tant qu\'administrateur');
      } else {
        navigate('/');
        toast.success('Connecté');
      }
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { error?: string } } };
      const msg = err?.response?.data?.error || 'Email ou mot de passe incorrect';
      toast.error(msg);
    },
  });
}

export function useLogout() {
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  return () => {
    logout();
    navigate('/login');
  };
}