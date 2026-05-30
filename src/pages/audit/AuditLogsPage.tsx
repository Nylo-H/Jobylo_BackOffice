import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import { Avatar } from '../../components/ui/avatar';
import { DataTable, type Column } from '../../components/ui/data-table';
import { useAuditLogs } from '../../hooks/use-audit';
import { ACTION_TYPES } from '../../lib/constants';
import { formatDate, getInitials } from '../../lib/utils';
import type { ActionLog } from '../../types/audit';

const ACTION_STYLES: Record<string, string> = {
  REGISTER: 'bg-blue-100 text-blue-800',
  LOGIN: 'bg-gray-100 text-gray-800',
  KYC_SUBMITTED: 'bg-yellow-100 text-yellow-800',
  KYC_APPROVED: 'bg-green-100 text-green-800',
  KYC_REJECTED: 'bg-red-100 text-red-800',
  PAYMENT_INITIATED: 'bg-purple-100 text-purple-800',
  PAYMENT_CONFIRMED: 'bg-emerald-100 text-emerald-800',
  SUBMIT_RATING: 'bg-amber-100 text-amber-800',
  CREATE_JOB: 'bg-indigo-100 text-indigo-800',
  ASSIGN_JOB: 'bg-cyan-100 text-cyan-800',
  COMPLETE_JOB: 'bg-lime-100 text-lime-800',
  SEND_MESSAGE: 'bg-sky-100 text-sky-800',
};

export default function AuditLogsPage() {
  const { data: logs = [], isLoading } = useAuditLogs();
  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState('ALL');

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch =
        log.user?.username?.toLowerCase().includes(search.toLowerCase()) ||
        log.details?.toLowerCase().includes(search.toLowerCase());
      const matchesAction = filterAction === 'ALL' || log.action === filterAction;
      return matchesSearch && matchesAction;
    });
  }, [logs, search, filterAction]);

  const columns: Column<ActionLog>[] = [
    {
      accessorKey: 'timestamp',
      header: 'Date',
      enableSorting: true,
      cell: ({ row }) => (
        <span className="text-text-secondary text-sm whitespace-nowrap">
          {formatDate(row.original.timestamp)}
        </span>
      ),
    },
    {
      accessorKey: 'user.username',
      header: 'Utilisateur',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Avatar className="h-7 w-7" fallback={getInitials(row.original.user?.username || '?')} />
          <span className="text-sm">{row.original.user?.username}</span>
        </div>
      ),
    },
    {
      accessorKey: 'action',
      header: 'Action',
      cell: ({ row }) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${ACTION_STYLES[row.original.action] || 'bg-gray-100 text-gray-800'}`}>
          {row.original.action.replace(/_/g, ' ')}
        </span>
      ),
    },
    {
      accessorKey: 'details',
      header: 'Détails',
      cell: ({ row }) => (
        <span className="text-text-secondary text-sm">{row.original.details}</span>
      ),
    },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text-primary">📋 Journal d'audit</h1>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-hint" />
          <Input
            placeholder="Rechercher dans les logs..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          options={[
            { value: 'ALL', label: 'Toutes les actions' },
            ...ACTION_TYPES.map((at) => ({ value: at.value, label: at.label })),
          ]}
          className="w-52"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <DataTable columns={columns} data={filteredLogs} isLoading={isLoading} />
        </CardContent>
      </Card>
    </motion.div>
  );
}