import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  FileCheck,
  Briefcase,
  Wallet,
  ScrollText,
  Tag,
  LogOut,
  Euro,
} from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import { api } from '../../api/client';
import { API_BASE_URL } from '../../config/api';
import type { AdminStatsResponse } from '../../types/user';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/users', label: 'Utilisateurs', icon: Users },
  { to: '/kyc', label: 'KYC', icon: FileCheck, badge: true },
  { to: '/jobs', label: 'Annonces', icon: Briefcase },
  { to: '/finance', label: 'Finance', icon: Euro },
  { to: '/transactions', label: 'Paiements', icon: Wallet },
  { to: '/audit', label: 'Audit', icon: ScrollText },
  { to: '/categories', label: 'Catégories', icon: Tag },
];

function NavItem({
  to,
  label,
  icon: Icon,
  end,
  badge,
}: {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  end?: boolean;
  badge?: number;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all relative group ${
          isActive
            ? 'bg-primary text-white shadow-sm'
            : 'text-text-secondary hover:bg-surface-variant hover:text-text-primary'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon className="h-5 w-5 shrink-0" />
          <span className="text-sm font-medium flex-1">{label}</span>
          {badge != null && badge > 0 && (
            <span
              className={`min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                isActive
                  ? 'bg-white text-primary'
                  : 'bg-error text-white animate-pulse'
              }`}
            >
              {badge > 99 ? '99+' : badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}

function UserAvatar() {
  const user = useAuthStore((s) => s.user);
  const photo = user?.photoProfile;
  const fullUrl = photo ? (photo.startsWith('http') ? photo : `${API_BASE_URL}${photo}`) : undefined;

  return (
    <Avatar className="h-9 w-9">
      <AvatarImage src={fullUrl} alt={user ? `${user.firstName} ${user.lastName}` : ''} />
      <AvatarFallback className="bg-primary text-white text-sm font-semibold">
        {user?.firstName?.[0]}
        {user?.lastName?.[0]}
      </AvatarFallback>
    </Avatar>
  );
}

export function AdminLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => (await api.get<AdminStatsResponse>('/admin/stats')).data,
    refetchInterval: 30_000,
    staleTime: 15_000,
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <aside className="w-64 bg-white border-r border-border flex flex-col shrink-0">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-lg">J</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-primary leading-tight">Jobylo</h1>
              <p className="text-[11px] text-text-secondary uppercase tracking-wider">Administration</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavItem
              key={item.to}
              to={item.to}
              label={item.label}
              icon={item.icon}
              end={item.end}
              badge={item.badge ? stats?.kycPending : undefined}
            />
          ))}
        </nav>

        <div className="p-4 border-t border-border bg-surface-variant/30">
          <div className="flex items-center gap-3 mb-3">
            <UserAvatar />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-text-primary">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-text-secondary truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-border rounded-lg text-text-secondary hover:bg-error/5 hover:text-error hover:border-error/30 transition-colors text-sm"
          >
            <LogOut className="h-4 w-4" /> Déconnexion
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="h-full"
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
}
