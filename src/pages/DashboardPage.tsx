import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { api } from '../api/client';
import { Users, Clock, Briefcase, FileCheck, TrendingUp, ShieldCheck } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { AdminStatsResponse } from '../types/user';

const COLOR_MAP = {
  primary: { bg: 'bg-primary/10', text: 'text-primary' },
  warning: { bg: 'bg-warning/10', text: 'text-warning' },
  success: { bg: 'bg-success/10', text: 'text-success' },
  info: { bg: 'bg-info/10', text: 'text-info' },
  error: { bg: 'bg-error/10', text: 'text-error' },
} as const;

type ColorKey = keyof typeof COLOR_MAP;

function KpiCard({
  title,
  value,
  icon: Icon,
  subtitle,
  color,
  pulse,
}: {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  subtitle?: string;
  color: ColorKey;
  pulse?: boolean;
}) {
  const palette = COLOR_MAP[color];
  return (
    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.15 }}>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm text-text-secondary font-medium">{title}</p>
              <p className="text-3xl font-bold mt-2 text-text-primary">
                {value.toLocaleString('fr-FR')}
              </p>
              {subtitle && <p className="text-xs text-text-secondary mt-1">{subtitle}</p>}
            </div>
            <div className={`p-3 rounded-xl ${palette.bg} relative shrink-0`}>
              <Icon className={`h-6 w-6 ${palette.text}`} />
              {pulse && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-error opacity-75 animate-ping" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-error" />
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function ChartCard({ title, data, height = 280 }: { title: string; data: { name: string; value: number; color: string }[]; height?: number }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-text-primary text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={50}
              outerRadius={90}
              paddingAngle={2}
              label={({ name, value }) => (value > 0 ? `${name}: ${value}` : '')}
              labelLine={false}
            >
              {data.map((d, i) => (
                <Cell key={i} fill={d.color} stroke="white" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              formatter={(value) => <span className="text-sm text-text-secondary">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => (await api.get<AdminStatsResponse>('/admin/stats')).data,
    refetchInterval: 30_000,
  });

  if (isLoading || !stats) {
    return (
      <div className="p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Tableau de bord</h1>
          <p className="text-text-secondary text-sm mt-1">Vue d'ensemble de la plateforme</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-24 bg-surface-variant animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-72 bg-surface-variant animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const kycData = [
    { name: 'En attente', value: stats.kycPending, color: '#F59E0B' },
    { name: 'Vérifiés', value: stats.kycVerified, color: '#10B981' },
    { name: 'Rejetés', value: stats.kycRejected, color: '#EF4444' },
  ];

  const jobData = [
    { name: 'Disponibles', value: stats.jobsPending, color: '#0D47A1' },
    { name: 'En cours', value: stats.jobsInProgress, color: '#1976D2' },
    { name: 'Terminés', value: stats.jobsDone, color: '#10B981' },
    { name: 'Expirés', value: stats.jobsExpired, color: '#6B7280' },
  ];

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Tableau de bord</h1>
        <p className="text-text-secondary text-sm mt-1">Vue d'ensemble de la plateforme</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Utilisateurs"
          value={stats.totalUsers}
          icon={Users}
          subtitle={`${stats.verifiedUsers} vérifiés`}
          color="primary"
        />
        <KpiCard
          title="KYC en attente"
          value={stats.kycPending}
          icon={ShieldCheck}
          subtitle="À traiter"
          color="warning"
          pulse={stats.kycPending > 0}
        />
        <KpiCard
          title="Annonces actives"
          value={stats.jobsPending + stats.jobsInProgress}
          icon={Briefcase}
          subtitle={`${stats.jobsPending} disponibles`}
          color="info"
        />
        <KpiCard
          title="Candidatures"
          value={stats.applicationsPending}
          icon={FileCheck}
          subtitle="En attente"
          color="info"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-success/10">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-xs text-text-secondary">Transactions</p>
                <p className="text-xl font-bold text-text-primary">
                  {stats.transactionsCompleted}
                </p>
                <p className="text-xs text-text-secondary">
                  {stats.transactionsHeld} en attente · {stats.transactionsCancelled} annulées
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10">
                <FileCheck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-text-secondary">Total candidatures</p>
                <p className="text-xl font-bold text-text-primary">
                  {stats.totalApplications}
                </p>
                <p className="text-xs text-text-secondary">
                  {stats.applicationsPending} en attente
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-info/10">
                <Clock className="h-5 w-5 text-info" />
              </div>
              <div>
                <p className="text-xs text-text-secondary">Logs d'audit</p>
                <p className="text-xl font-bold text-text-primary">{stats.totalAuditLogs}</p>
                <p className="text-xs text-text-secondary">entrées enregistrées</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Annonces par statut" data={jobData} />
        <ChartCard title="Statuts KYC" data={kycData} />
      </div>
    </div>
  );
}
