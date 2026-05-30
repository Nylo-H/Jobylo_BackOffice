import { motion } from 'framer-motion';
import { Users, Briefcase, ShieldCheck, DollarSign } from 'lucide-react';
import { StatCard } from '../components/dashboard/StatCard';
import { JobsChart } from '../components/dashboard/JobsChart';
import { RecentActivity } from '../components/dashboard/RecentActivity';
import { useAuditLogs } from '../hooks/use-audit';
import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '../lib/constants';
import { adminApi } from '../api/admin.api';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

export default function DashboardPage() {
  const { data: auditLogs = [] } = useAuditLogs();

  // Requêtes parallèles avec données mockées en fallback
  const { data: userCount = 1234 } = useQuery({
    queryKey: ['admin', 'users', 'count'],
    queryFn: () => adminApi.getUsers().then((r) => r.data.length),
    placeholderData: 1234,
  });

  const { data: jobsPending = 456 } = useQuery({
    queryKey: ['admin', 'jobs', 'pending'],
    queryFn: () => adminApi.getJobs('PENDING').then((r) => r.data.length),
    placeholderData: 456,
  });

  const { data: kycPendingDocs } = useQuery({
    queryKey: QUERY_KEYS.ADMIN_KYC('PENDING'),
    queryFn: () => adminApi.getKycDocuments('PENDING').then((r) => r.data),
  });

  const kycPending = kycPendingDocs?.length ?? 23;

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary mb-6">📊 Tableau de Bord</h1>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
      >
        <StatCard icon={<Users size={20} />} label="Utilisateurs totaux" value={userCount} trend="+12%" />
        <StatCard icon={<Briefcase size={20} />} label="Missions disponibles" value={jobsPending} trend="+5%" />
        <StatCard icon={<ShieldCheck size={20} />} label="KYC en attente" value={kycPending} />
        <StatCard icon={<DollarSign size={20} />} label="Chiffre d'affaires" value={12500000} />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <JobsChart />
        <RecentActivity logs={auditLogs} />
      </div>
    </div>
  );
}