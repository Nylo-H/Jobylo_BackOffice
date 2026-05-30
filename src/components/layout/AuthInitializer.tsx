import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/auth.store';
import { api } from '../../api/client';

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { accessToken, isAuthenticated, setAuth, setLoading, logout } = useAuthStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      // Si déjà authentifié (juste après login), on skip la vérification
      if (isAuthenticated) {
        console.log('[AuthInit] Already authenticated, skipping');
        setLoading(false);
        if (!cancelled) setReady(true);
        return;
      }

      if (!accessToken) {
        console.log('[AuthInit] No token, ready');
        setLoading(false);
        if (!cancelled) setReady(true);
        return;
      }

      try {
        console.log('[AuthInit] Checking /auth/me...');
        const { data: me } = await api.get('/auth/me');
        console.log('[AuthInit] /auth/me success:', me.username);
        if (!cancelled) {
          setAuth(me, accessToken);
          setReady(true);
        }
        return;
      } catch (err1) {
        console.log('[AuthInit] /auth/me failed:', err1);
      }

      // Tentative de refresh via cookie
      try {
        const { data: refreshData } = await api.post('/auth/refresh', {});
        const { data: me } = await api.get('/auth/me', {
          headers: { Authorization: `Bearer ${refreshData.accesstoken}` },
        });
        console.log('[AuthInit] Refresh + /me success:', me.username);
        if (!cancelled) setAuth(me, refreshData.accesstoken);
      } catch (err2) {
        console.log('[AuthInit] Refresh failed:', err2);
        if (!cancelled) logout();
      } finally {
        setLoading(false);
        if (!cancelled) setReady(true);
      }
    };

    init();

    return () => {
      cancelled = true;
    };
  }, []); // Ne run qu'une fois au montage

  if (!ready) {
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

  return <>{children}</>;
}