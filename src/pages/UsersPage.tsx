import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { Button } from '../components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '../components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  Search,
  MoreVertical,
  Shield,
  ShieldOff,
  Trash2,
  Users as UsersIcon,
  Inbox,
  Loader2,
  X,
} from 'lucide-react';
import { api } from '../api/client';
import { useAuthStore } from '../store/auth.store';
import { toast } from 'sonner';
import type { User } from '../types/user';
import { API_BASE_URL } from '../config/api';
import { getApiErrorMessage } from '../lib/errors';

function KycBadge({ status }: { status: string | null }) {
  if (status === 'VERIFIED')
    return (
      <span className="inline-flex items-center rounded-full bg-success/10 text-success px-2.5 py-0.5 text-xs font-semibold">
        ✓ Vérifié
      </span>
    );
  if (status === 'PENDING')
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 text-warning px-2.5 py-0.5 text-xs font-semibold">
        <span className="h-1.5 w-1.5 rounded-full bg-warning animate-pulse" /> En attente
      </span>
    );
  if (status === 'REJECTED')
    return (
      <span className="inline-flex items-center rounded-full bg-error/10 text-error px-2.5 py-0.5 text-xs font-semibold">
        ✗ Rejeté
      </span>
    );
  return (
    <span className="inline-flex items-center rounded-full bg-surface-variant text-text-secondary px-2.5 py-0.5 text-xs font-semibold">
      Non soumis
    </span>
  );
}

function PromoteAdminDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [tab, setTab] = useState<'existing' | 'new'>('existing');
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ firstName: '', lastName: '', username: '', email: '', password: '' });
  const [creating, setCreating] = useState(false);

  const { data: users = [] } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => (await api.get<User[]>('/admin/users')).data,
    enabled: open,
  });

  const candidates = users
    .filter((u) => u.role === 'USER')
    .filter((u) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q)
      );
    });

  const promoteMutation = useMutation({
    mutationFn: async (userId: string) =>
      (await api.put(`/admin/users/${userId}/role`, { role: 'ADMIN' })).data,
    onSuccess: () => {
      toast.success('Utilisateur promu ADMIN avec succès');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      onOpenChange(false);
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Erreur lors de la promotion')),
  });

  const createAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const { data: created } = await api.post<User>('/auth/register', form);
      await api.put(`/admin/users/${created.id}/role`, { role: 'ADMIN' });
      toast.success('Compte admin créé avec succès');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      onOpenChange(false);
      setForm({ firstName: '', lastName: '', username: '', email: '', password: '' });
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Erreur lors de la création'));
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" /> Ajouter un administrateur
          </DialogTitle>
          <DialogDescription>
            Promouvez un utilisateur existant ou créez un nouveau compte admin.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-1 p-1 bg-surface-variant rounded-lg">
          {(['existing', 'new'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                tab === t
                  ? 'bg-surface text-text-primary shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {t === 'existing' ? 'Utilisateur existant' : 'Nouveau compte'}
            </button>
          ))}
        </div>

        {tab === 'existing' ? (
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-text-hint" />
              <Input
                placeholder="Rechercher un utilisateur..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="max-h-80 overflow-y-auto -mx-1 px-1">
              {candidates.length === 0 ? (
                <div className="text-center py-10">
                  <Inbox className="h-10 w-10 text-text-hint mx-auto mb-2" />
                  <p className="text-sm text-text-secondary">Aucun utilisateur trouvé</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {candidates.map((u) => {
                    const photo = u.photoProfile
                      ? u.photoProfile.startsWith('http')
                        ? u.photoProfile
                        : `${API_BASE_URL}${u.photoProfile}`
                      : undefined;
                    return (
                      <button
                        key={u.id}
                        onClick={() => promoteMutation.mutate(u.id)}
                        disabled={promoteMutation.isPending}
                        className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-surface-variant text-left transition-colors group disabled:opacity-50"
                      >
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={photo} alt={`${u.firstName} ${u.lastName}`} />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                            {u.firstName?.[0]}
                            {u.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-text-primary truncate">
                            {u.firstName} {u.lastName}
                          </div>
                          <div className="text-xs text-text-secondary truncate">{u.email}</div>
                        </div>
                        <Shield className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={createAdmin} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-text-primary block mb-1">Prénom *</label>
                <Input
                  required
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-text-primary block mb-1">Nom *</label>
                <Input
                  required
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-text-primary block mb-1">Username *</label>
              <Input
                required
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-text-primary block mb-1">Email *</label>
              <Input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-text-primary block mb-1">
                Mot de passe * (min. 8 caractères)
              </label>
              <Input
                type="password"
                required
                minLength={8}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={creating}>
                {creating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" /> Création...
                  </>
                ) : (
                  'Créer le compte admin'
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText,
  variant,
  onConfirm,
  loading,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  description: string;
  confirmText: string;
  variant: 'default' | 'destructive';
  onConfirm: () => void;
  loading?: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {variant === 'destructive' ? (
              <Trash2 className="h-5 w-5 text-error" />
            ) : (
              <Shield className="h-5 w-5 text-primary" />
            )}
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Annuler
          </Button>
          <Button
            variant={variant === 'destructive' ? 'destructive' : 'default'}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function UsersPage() {
  const [search, setSearch] = useState('');
  const [promoteOpen, setPromoteOpen] = useState(false);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [pendingAction, setPendingAction] = useState<{
    user: User;
    role: 'USER' | 'ADMIN';
  } | null>(null);

  const currentUser = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => (await api.get<User[]>('/admin/users')).data,
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: 'USER' | 'ADMIN' }) =>
      (await api.put(`/admin/users/${userId}/role`, { role })).data,
    onSuccess: (_data, vars) => {
      toast.success(vars.role === 'ADMIN' ? 'Rôle ADMIN attribué' : 'Rôle USER attribué');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      setPendingAction(null);
    },
    onError: (e) => {
      toast.error(getApiErrorMessage(e, 'Erreur'));
      setPendingAction(null);
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => (await api.delete(`/admin/users/${userId}`)).data,
    onSuccess: () => {
      toast.success('Utilisateur supprimé');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      setDeleteUser(null);
    },
    onError: (e) => {
      toast.error(getApiErrorMessage(e, 'Erreur'));
      setDeleteUser(null);
    },
  });

  const filtered = users.filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q)
    );
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Utilisateurs</h1>
          <p className="text-text-secondary text-sm mt-1">
            {users.length} utilisateur{users.length > 1 ? 's' : ''} au total
          </p>
        </div>
        <Button onClick={() => setPromoteOpen(true)} className="gap-2">
          <Shield className="h-4 w-4" /> Ajouter un admin
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-text-hint" />
            <Input
              placeholder="Rechercher par nom, email, username..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-2.5 text-text-hint hover:text-text-primary"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-text-secondary mt-3">Chargement des utilisateurs...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-16 text-center">
              <UsersIcon className="h-12 w-12 text-text-hint mx-auto mb-3" />
              <p className="text-text-primary font-medium">Aucun utilisateur trouvé</p>
              <p className="text-sm text-text-secondary mt-1">
                {search ? 'Essayez avec d\'autres termes' : 'Aucun utilisateur enregistré'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface-variant">
                  <tr>
                    <th className="text-left p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                      Utilisateur
                    </th>
                    <th className="text-left p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                      Email
                    </th>
                    <th className="text-left p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                      Rôle
                    </th>
                    <th className="text-left p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                      KYC
                    </th>
                    <th className="text-left p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                      Note
                    </th>
                    <th className="text-right p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((user) => {
                    const photo = user.photoProfile
                      ? user.photoProfile.startsWith('http')
                        ? user.photoProfile
                        : `${API_BASE_URL}${user.photoProfile}`
                      : undefined;
                    return (
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border-t border-border hover:bg-surface-variant/50 transition-colors"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarImage
                                src={photo}
                                alt={`${user.firstName} ${user.lastName}`}
                              />
                              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                                {user.firstName?.[0]}
                                {user.lastName?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <div className="font-medium text-text-primary truncate">
                                {user.firstName} {user.lastName}
                              </div>
                              <div className="text-xs text-text-secondary truncate">
                                @{user.username}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-text-primary">{user.email}</td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              user.role === 'ADMIN'
                                ? 'bg-primary text-white'
                                : 'bg-surface-variant text-text-secondary'
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="p-4">
                          <KycBadge status={user.kycStatus} />
                        </td>
                        <td className="p-4 text-sm text-text-secondary">
                          {user.averageRating ? (
                            <span className="inline-flex items-center gap-1">
                              <span className="text-warning">⭐</span>
                              {user.averageRating.toFixed(1)}{' '}
                              <span className="text-text-hint">({user.totalRatings})</span>
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger>
                              <Button variant="ghost" size="icon" className="hover:bg-surface-variant">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="min-w-[200px]">
                              {user.role === 'USER' ? (
                                <DropdownMenuItem
                                  onClick={() => setPendingAction({ user, role: 'ADMIN' })}
                                >
                                  <Shield className="h-4 w-4 mr-2 text-primary" /> Promouvoir ADMIN
                                </DropdownMenuItem>
                              ) : (
                                user.id !== currentUser?.id && (
                                  <DropdownMenuItem
                                    onClick={() => setPendingAction({ user, role: 'USER' })}
                                  >
                                    <ShieldOff className="h-4 w-4 mr-2 text-warning" /> Rétrograder USER
                                  </DropdownMenuItem>
                                )
                              )}
                              {user.id !== currentUser?.id && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => setDeleteUser(user)}
                                    className="text-error focus:text-error"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" /> Supprimer
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <PromoteAdminDialog open={promoteOpen} onOpenChange={setPromoteOpen} />

      {pendingAction && (
        <ConfirmDialog
          open={!!pendingAction}
          onOpenChange={(o) => !o && setPendingAction(null)}
          title={pendingAction.role === 'ADMIN' ? 'Promouvoir en ADMIN' : 'Rétrograder en USER'}
          description={`Voulez-vous vraiment ${
            pendingAction.role === 'ADMIN' ? 'promouvoir' : 'rétrograder'
          } ${pendingAction.user.firstName} ${pendingAction.user.lastName} ?`}
          confirmText={pendingAction.role === 'ADMIN' ? 'Promouvoir' : 'Rétrograder'}
          variant="default"
          onConfirm={() =>
            updateRoleMutation.mutate({ userId: pendingAction.user.id, role: pendingAction.role })
          }
          loading={updateRoleMutation.isPending}
        />
      )}

      {deleteUser && (
        <ConfirmDialog
          open={!!deleteUser}
          onOpenChange={(o) => !o && setDeleteUser(null)}
          title="Supprimer l'utilisateur"
          description={`Cette action est irréversible. L'utilisateur ${deleteUser.firstName} ${deleteUser.lastName} et toutes ses données associées seront définitivement supprimés.`}
          confirmText="Supprimer définitivement"
          variant="destructive"
          onConfirm={() => deleteUserMutation.mutate(deleteUser.id)}
          loading={deleteUserMutation.isPending}
        />
      )}
    </motion.div>
  );
}
