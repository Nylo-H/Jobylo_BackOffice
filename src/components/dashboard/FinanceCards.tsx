import { Card, CardContent } from '../ui/card';
import { motion } from 'framer-motion';
import { useFinanceStats } from '../../hooks/useFinance';
import type { FinanceStatsResponse } from '../../api/finance';
import { Euro, Banknote, TrendingUp, ArrowUpRight, Inbox } from 'lucide-react';

function formatFcfa(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(value) + ' FCFA';
}

function SkeletonCard() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="h-4 w-24 bg-surface-variant animate-pulse rounded mb-3" />
        <div className="h-8 w-32 bg-surface-variant animate-pulse rounded" />
      </CardContent>
    </Card>
  );
}

function EmptyCard({ title }: { title: string }) {
  return (
    <Card>
      <CardContent className="p-6">
        <p className="text-sm font-medium text-text-secondary">{title}</p>
        <div className="text-2xl font-bold text-text-primary mt-2">—</div>
        <p className="mt-1 text-xs text-text-secondary flex items-center gap-1">
          <Inbox className="h-3 w-3" /> Données non disponibles
        </p>
      </CardContent>
    </Card>
  );
}

export function FinanceCards() {
  const { data, isLoading } = useFinanceStats();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {['Volume total', 'Commission', 'Net workers', 'Moyen / job'].map((title) => (
          <EmptyCard key={title} title={title} />
        ))}
      </div>
    );
  }

  const commissionRatio =
    data.totalVolume > 0
      ? ((data.totalCommissionCollected / data.totalVolume) * 100).toFixed(1)
      : '0';

  const cards: {
    title: string;
    value: string;
    sub: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    bg: string;
  }[] = [
    {
      title: 'Volume total',
      value: formatFcfa(data.totalVolume),
      sub: `${data.completedTransactions} transactions complétées`,
      icon: Euro,
      color: 'text-success',
      bg: 'bg-success/10',
    },
    {
      title: 'Commission prélevée',
      value: formatFcfa(data.totalCommissionCollected),
      sub: `${commissionRatio}% du volume`,
      icon: TrendingUp,
      color: 'text-info',
      bg: 'bg-info/10',
    },
    {
      title: 'Net versé aux workers',
      value: formatFcfa(data.totalPaidToWorkers),
      sub: `${data.completedTransactions} paiements effectués`,
      icon: Banknote,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      title: 'Montant moyen / job',
      value: formatFcfa(data.averageTransactionAmount),
      sub: 'toutes transactions confondues',
      icon: ArrowUpRight,
      color: 'text-warning',
      bg: 'bg-warning/10',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.title}
            whileHover={{ y: -2 }}
            transition={{ duration: 0.15 }}
          >
            <Card className="hover:shadow-md transition-shadow h-full">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-text-secondary font-medium">{card.title}</p>
                    <p className="text-2xl font-bold text-text-primary mt-2 truncate">
                      {card.value}
                    </p>
                    <p className="mt-1 text-xs text-text-secondary">{card.sub}</p>
                  </div>
                  <div className={`p-2.5 rounded-xl ${card.bg} shrink-0`}>
                    <Icon className={`h-5 w-5 ${card.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}

// type re-export for consumers
export type { FinanceStatsResponse };
