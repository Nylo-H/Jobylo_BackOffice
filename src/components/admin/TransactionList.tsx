import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { motion } from 'framer-motion';
import { api } from '../../api/client';
import { formatDate } from '../../lib/utils';

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
  status: string;
}

const STATUS_META: Record<string, { label: string; className: string }> = {
  COMPLETED: { label: 'Complétée', className: 'bg-success/10 text-success' },
  HELD: { label: 'En attente', className: 'bg-warning/10 text-warning' },
  CANCELLED: { label: 'Annulée', className: 'bg-error/10 text-error' },
};

function formatFcfa(amount: number): string {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(amount) + ' FCFA';
}

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

export function TransactionList() {
  const { data: tx = [] } = useQuery({
    queryKey: ['admin-transactions'],
    queryFn: async () => (await api.get<Payment[]>('/admin/transactions')).data,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-text-primary">Dernières transactions</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {tx.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm text-text-secondary">Aucune transaction à afficher</p>
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
                    Net
                  </th>
                  <th className="text-left p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody>
                {tx.slice(0, 10).map((t) => (
                  <motion.tr
                    key={t.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-t border-border hover:bg-surface-variant/50 transition-colors"
                  >
                    <td className="p-4 text-sm text-text-secondary whitespace-nowrap">
                      {formatDate(t.createdAt)}
                    </td>
                    <td className="p-4 text-sm text-text-primary">{t.jobTitle}</td>
                    <td className="p-4 text-sm text-text-primary">{t.buyerUsername}</td>
                    <td className="p-4 text-sm text-text-primary">{t.sellerUsername}</td>
                    <td className="p-4 text-right font-mono text-text-primary">
                      {formatFcfa(t.amount)}
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
  );
}
