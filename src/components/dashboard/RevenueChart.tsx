import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';
import { useFinanceStats } from '../../hooks/useFinance';
import { TrendingUp, Inbox } from 'lucide-react';

const MONTHS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

function formatMonth(m: { year: number; month: number }): string {
  return `${MONTHS[m.month - 1]} ${String(m.year).slice(2)}`;
}

function formatFcfa(v: number): string {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(v) + ' FCFA';
}

const tooltipStyle = {
  backgroundColor: 'white',
  border: '1px solid #E5E7EB',
  borderRadius: '8px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  padding: '8px 12px',
};

function Skeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="h-5 w-48 bg-surface-variant animate-pulse rounded" />
      </CardHeader>
      <CardContent>
        <div className="h-72 bg-surface-variant animate-pulse rounded" />
      </CardContent>
    </Card>
  );
}

export function RevenueChart() {
  const { data, isLoading } = useFinanceStats();

  if (isLoading) return <Skeleton />;

  if (!data?.revenueByMonth?.length) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-text-primary flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-text-secondary" />
            Revenus mensuels
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72 flex flex-col items-center justify-center text-text-secondary">
            <Inbox className="h-10 w-10 mb-2 opacity-50" />
            <p className="text-sm font-medium">Aucune donnée disponible</p>
            <p className="text-xs mt-1">
              Aucune transaction complétée sur les 12 derniers mois
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Le backend envoie probablement du plus ancien au plus récent, on inverse pour affichage chronologique
  const chartData = [...data.revenueByMonth].reverse().map((m) => ({
    name: formatMonth(m),
    Volume: m.volume,
    Commission: m.commission,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-text-primary flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            Revenus mensuels
            <span className="text-xs font-normal text-text-secondary ml-1">(12 derniers mois)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#6B7280' }}
                  interval={0}
                  angle={-30}
                  textAnchor="end"
                  height={50}
                />
                <YAxis
                  tickFormatter={formatFcfa}
                  tick={{ fontSize: 11, fill: '#6B7280' }}
                  width={80}
                />
                <Tooltip
                  formatter={(v) => formatFcfa(Number(v))}
                  contentStyle={tooltipStyle}
                  cursor={{ fill: 'rgba(13, 71, 161, 0.04)' }}
                />
                <Legend
                  wrapperStyle={{ paddingTop: 8 }}
                  iconType="circle"
                  formatter={(value) => (
                    <span className="text-sm text-text-secondary">{value}</span>
                  )}
                />
                <Bar
                  dataKey="Volume"
                  fill="#0D47A1"
                  name="Volume"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={36}
                />
                <Bar
                  dataKey="Commission"
                  fill="#F59E0B"
                  name="Commission"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={36}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
