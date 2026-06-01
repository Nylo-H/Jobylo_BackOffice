import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Search, Inbox } from 'lucide-react';
import { api } from '../api/client';
import type { ActionLog, ActionType } from '../types/audit';

const ACTION_LABELS: Partial<Record<ActionType, { label: string; color: string }>> = {
  REGISTER: { label: 'Inscription', color: 'bg-info/10 text-info' },
  LOGIN: { label: 'Connexion', color: 'bg-surface-variant text-text-secondary' },
  KYC_SUBMITTED: { label: 'KYC soumis', color: 'bg-warning/10 text-warning' },
  KYC_APPROVED: { label: 'KYC approuvé', color: 'bg-success/10 text-success' },
  KYC_REJECTED: { label: 'KYC rejeté', color: 'bg-error/10 text-error' },
  PAYMENT_INITIATED: { label: 'Paiement initié', color: 'bg-info/10 text-info' },
  PAYMENT_CONFIRMED: { label: 'Paiement confirmé', color: 'bg-success/10 text-success' },
  SUBMIT_RATING: { label: 'Notation', color: 'bg-warning/10 text-warning' },
  CREATE_JOB: { label: 'Création mission', color: 'bg-primary/10 text-primary' },
  ASSIGN_JOB: { label: 'Attribution', color: 'bg-primary/10 text-primary' },
  COMPLETE_JOB: { label: 'Terminée', color: 'bg-success/10 text-success' },
  SEND_MESSAGE: { label: 'Message', color: 'bg-surface-variant text-text-secondary' },
};

function formatAction(action: string) {
  const meta = ACTION_LABELS[action as ActionType];
  return {
    label: meta?.label ?? action.replace(/_/g, ' '),
    color: meta?.color ?? 'bg-surface-variant text-text-secondary',
  };
}

export default function AuditPage() {
  const [action, setAction] = useState('all');
  const [search, setSearch] = useState('');

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['admin-audit'],
    queryFn: async () => (await api.get<ActionLog[]>('/admin/audit')).data,
  });

  const actions = useMemo(
    () => Array.from(new Set(logs.map((l) => l.action))).sort(),
    [logs]
  );

  const filtered = useMemo(
    () =>
      logs.filter((l) => {
        if (action !== 'all' && l.action !== action) return false;
        if (!search) return true;
        const q = search.toLowerCase();
        return (
          l.user?.username?.toLowerCase().includes(q) ||
          l.details?.toLowerCase().includes(q) ||
          l.user?.email?.toLowerCase().includes(q)
        );
      }),
    [logs, action, search]
  );

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Journal d'audit</h1>
        <p className="text-text-secondary text-sm mt-1">
          Historique complet des actions sur la plateforme
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-text-hint" />
          <Input
            placeholder="Rechercher un utilisateur ou un détail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={action}
          onChange={(e) => setAction(e.target.value)}
          className="h-9 px-3 rounded-md border border-border bg-white text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="all">Toutes les actions</option>
          {actions.map((a) => (
            <option key={a} value={a}>
              {formatAction(a).label}
            </option>
          ))}
        </select>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-text-secondary mt-3">Chargement des logs...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-16 text-center">
              <Inbox className="h-12 w-12 text-text-hint mx-auto mb-3" />
              <p className="text-text-primary font-medium">Aucun log trouvé</p>
              <p className="text-sm text-text-secondary mt-1">
                {search || action !== 'all'
                  ? 'Essayez de modifier vos filtres'
                  : "Aucune action n'a encore été enregistrée"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface-variant">
                  <tr>
                    <th className="text-left p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                      Date
                    </th>
                    <th className="text-left p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                      Utilisateur
                    </th>
                    <th className="text-left p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                      Action
                    </th>
                    <th className="text-left p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                      Détails
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((log) => {
                    const { label, color } = formatAction(log.action);
                    return (
                      <motion.tr
                        key={log.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="border-t border-border hover:bg-surface-variant/50 transition-colors"
                      >
                        <td className="p-4 text-sm text-text-secondary whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleString('fr-FR')}
                        </td>
                        <td className="p-4">
                          <div>
                            <p className="text-sm font-medium text-text-primary">
                              {log.user?.username ?? '—'}
                            </p>
                            <p className="text-xs text-text-secondary">{log.user?.email}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${color}`}
                          >
                            {label}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-text-secondary font-mono break-all max-w-md">
                          {log.details}
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

      {!isLoading && filtered.length > 0 && (
        <p className="text-xs text-text-secondary text-center">
          {filtered.length} entrée{filtered.length > 1 ? 's' : ''} affichée
          {filtered.length > 1 ? 's' : ''} sur {logs.length} au total
        </p>
      )}
    </div>
  );
}
