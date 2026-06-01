import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent } from '../components/ui/card';
import { Briefcase } from 'lucide-react';
import { api } from '../api/client';
import { formatDate, formatPrice } from '../lib/utils';

type JobStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED' | string;

interface Job {
  id: string;
  title: string;
  description?: string;
  budget: number;
  status: JobStatus;
  clientUsername: string;
  freelancerUsername?: string | null;
  createdAt: string;
}

const STATUS_META: Record<string, { label: string; className: string }> = {
  PENDING: { label: 'Disponible', className: 'bg-primary/10 text-primary' },
  IN_PROGRESS: { label: 'En cours', className: 'bg-info/10 text-info' },
  COMPLETED: { label: 'Terminée', className: 'bg-success/10 text-success' },
  DONE: { label: 'Terminée', className: 'bg-success/10 text-success' },
  CANCELLED: { label: 'Annulée', className: 'bg-error/10 text-error' },
  EXPIRED: { label: 'Expirée', className: 'bg-surface-variant text-text-secondary' },
};

function StatusBadge({ status }: { status: string }) {
  const meta = STATUS_META[status] ?? {
    label: status.replace(/_/g, ' '),
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

export default function JobsPage() {
  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['admin-jobs'],
    queryFn: async () => (await api.get<Job[]>('/admin/jobs')).data,
  });

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Annonces</h1>
        <p className="text-text-secondary text-sm mt-1">
          Toutes les annonces publiées sur la plateforme
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-text-secondary mt-3">Chargement des annonces...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="p-16 text-center">
              <Briefcase className="h-12 w-12 text-text-hint mx-auto mb-3" />
              <p className="text-text-primary font-medium">Aucune annonce</p>
              <p className="text-sm text-text-secondary mt-1">
                Les annonces créées par les utilisateurs apparaîtront ici
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface-variant">
                  <tr>
                    <th className="text-left p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                      Titre
                    </th>
                    <th className="text-left p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                      Client
                    </th>
                    <th className="text-left p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                      Freelance
                    </th>
                    <th className="text-right p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                      Budget
                    </th>
                    <th className="text-left p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="text-left p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                      Créée le
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => (
                    <motion.tr
                      key={job.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-t border-border hover:bg-surface-variant/50 transition-colors"
                    >
                      <td className="p-4">
                        <p className="text-sm font-medium text-text-primary">{job.title}</p>
                        {job.description && (
                          <p className="text-xs text-text-secondary line-clamp-1 mt-0.5">
                            {job.description}
                          </p>
                        )}
                      </td>
                      <td className="p-4 text-sm text-text-primary">{job.clientUsername}</td>
                      <td className="p-4 text-sm text-text-primary">
                        {job.freelancerUsername || (
                          <span className="text-text-hint">—</span>
                        )}
                      </td>
                      <td className="p-4 text-right font-mono font-semibold text-text-primary">
                        {formatPrice(job.budget, 'XOF')}
                      </td>
                      <td className="p-4">
                        <StatusBadge status={job.status} />
                      </td>
                      <td className="p-4 text-sm text-text-secondary whitespace-nowrap">
                        {formatDate(job.createdAt)}
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
