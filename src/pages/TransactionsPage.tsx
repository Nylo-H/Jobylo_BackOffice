import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent } from '../components/ui/card';
import { Wallet } from 'lucide-react';
import { api } from '../api/client';
import { formatDate } from '../lib/utils';

interface Payment {
  id: string;
  createdAt: string;
  jobTitle: string;
  buyerUsername: string;
  sellerUsername: string;
  amount: number;
  commissionAmount: number;
  commissionPercentage: number;
  netAmount: number;
  status: 'HELD' | 'COMPLETED' | 'CANCELLED' | string;
}

const STATUS_META: Record<string, { label: string; className: string }> = {
  COMPLETED: { label: 'Complétée', className: 'bg-success/10 text-success' },
  HELD: { label: 'En attente', className: 'bg-warning/10 text-warning' },
  CANCELLED: { label: 'Annulée', className: 'bg-error/10 text-error' },
};

function StatusBadge({ status }: { status: string }) {
  const meta = STATUS_META[status] ?? {
    label: status,
    className: 'bg-surface-variant text-text-secondary',
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${meta.className}`}
    >
      {meta.label}
    </span>
  );
}

function formatFcfa(amount: number): string {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(amount) + ' FCFA';
}

export default function TransactionsPage() {
  const { data: tx = [], isLoading } = useQuery({
    queryKey: ['admin-transactions'],
    queryFn: async () => (await api.get<Payment[]>('/admin/transactions')).data,
  });

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Transactions</h1>
        <p className="text-text-secondary text-sm mt-1">Toutes les opérations financières de la plateforme</p>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-text-secondary mt-3">Chargement...</p>
            </div>
          ) : tx.length === 0 ? (
            <div className="p-16 text-center">
              <Wallet className="h-12 w-12 text-text-hint mx-auto mb-3" />
              <p className="text-text-primary font-medium">Aucune transaction</p>
              <p className="text-sm text-text-secondary mt-1">
                Les transactions apparaîtront ici dès qu'un paiement sera effectué
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
                      Job
                    </th>
                    <th className="text-left p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                      Acheteur
                    </th>
                    <th className="text-left p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                      Vendeur
                    </th>
                    <th className="text-right p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                      Montant
                    </th>
                    <th className="text-right p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                      Commission
                    </th>
                    <th className="text-right p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                      Net
                    </th>
                    <th className="text-left p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                      Statut
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tx.map((t) => (
                    <motion.tr
                      key={t.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-t border-border hover:bg-surface-variant/50 transition-colors"
                    >
                      <td className="p-4 text-sm text-text-secondary whitespace-nowrap">
                        {formatDate(t.createdAt)}
                      </td>
                      <td className="p-4 text-sm font-medium text-text-primary">{t.jobTitle}</td>
                      <td className="p-4 text-sm text-text-primary">{t.buyerUsername}</td>
                      <td className="p-4 text-sm text-text-primary">{t.sellerUsername}</td>
                      <td className="p-4 text-right font-mono text-text-primary">
                        {formatFcfa(t.amount)}
                      </td>
                      <td className="p-4 text-right font-mono text-text-secondary">
                        {formatFcfa(t.commissionAmount)}{' '}
                        <span className="text-xs">({t.commissionPercentage}%)</span>
                      </td>
                      <td className="p-4 text-right font-mono font-semibold text-text-primary">
                        {formatFcfa(t.netAmount)}
                      </td>
                      <td className="p-4">
                        <StatusBadge status={t.status} />
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
