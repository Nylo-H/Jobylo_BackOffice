import { useAuthStore } from '../../store/auth.store';
import { useLogout } from '../../hooks/use-auth';
import { Avatar } from '../ui/avatar';
import { Button } from '../ui/button';
import { Menu } from 'lucide-react';
import { useUIStore } from '../../store/ui.store';

export function Header() {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const { toggleSidebar } = useUIStore();

  return (
    <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-6 sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-surface-variant text-text-secondary lg:hidden"
        >
          <Menu size={20} />
        </button>
        <h2 className="text-lg font-semibold text-text-primary">Administration</h2>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-text-primary">
              {user?.username || 'Admin'}
            </p>
            <p className="text-xs text-text-secondary">Administrateur</p>
          </div>
          <Avatar
            fallback={user?.username?.charAt(0).toUpperCase() || 'A'}
            src={user?.photoProfil || undefined}
          />
        </div>
        <Button variant="outline" size="sm" onClick={logout}>
          Déconnexion
        </Button>
      </div>
    </header>
  );
}