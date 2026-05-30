import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  ScrollText,
  FolderTree,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useUIStore } from '../../store/ui.store';
import { useAuthStore } from '../../store/auth.store';
import { cn } from '../../lib/utils';

const NAV_ITEMS = [
  { label: 'Tableau de bord', icon: LayoutDashboard, path: '/admin/dashboard' },
  { label: 'Utilisateurs', icon: Users, path: '/admin/users' },
  { label: 'Vérifications KYC', icon: ShieldCheck, path: '/admin/kyc' },
  { label: "Journal d'audit", icon: ScrollText, path: '/admin/audit' },
  { label: 'Catégories', icon: FolderTree, path: '/admin/categories' },
];

export function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarOpen ? 260 : 72 }}
      className="fixed left-0 top-0 h-screen bg-surface border-r border-border z-30 flex flex-col"
    >
      <div className={cn('flex items-center h-16 px-4 border-b border-border', sidebarOpen ? 'justify-between' : 'justify-center')}>
        {sidebarOpen && (
          <span className="text-xl font-bold text-primary">Jobylo</span>
        )}
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg hover:bg-surface-variant text-text-secondary"
        >
          {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>

      <nav className="flex-1 py-4 space-y-1 px-2">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group relative',
                isActive
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-text-secondary hover:bg-surface-variant hover:text-text-primary'
              )
            }
          >
            <item.icon size={20} />
            {sidebarOpen && (
              <span className="text-sm">{item.label}</span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-2 border-t border-border">
        <button
          onClick={handleLogout}
          className={cn(
            'flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-text-secondary hover:bg-surface-variant hover:text-error transition-colors',
            !sidebarOpen && 'justify-center'
          )}
        >
          <LogOut size={20} />
          {sidebarOpen && <span className="text-sm">Déconnexion</span>}
        </button>
      </div>
    </motion.aside>
  );
}