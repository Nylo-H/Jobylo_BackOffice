import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MoreHorizontal,
  Eye,
  Shield,
  Trash2,
  CheckCircle2,
  XCircle,
  Search,
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Avatar } from '../../components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '../../components/ui/dropdown-menu';
import { DataTable, type Column } from '../../components/ui/data-table';
import { useUsers, useDeleteUser, useUpdateUserRole } from '../../hooks/use-users';
import type { User } from '../../types/user';
import { getInitials } from '../../lib/utils';

export default function UsersListPage() {
  const { data: users = [], isLoading } = useUsers();
  const deleteMutation = useDeleteUser();
  const roleMutation = useUpdateUserRole();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const columns: Column<User>[] = [
    {
      accessorKey: 'username',
      header: 'Utilisateur',
      enableSorting: true,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8" fallback={getInitials(row.original.username)} />
          <div>
            <p className="font-medium">{row.original.username}</p>
            <p className="text-xs text-text-secondary">{row.original.email}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'role',
      header: 'Rôle',
      enableSorting: true,
      cell: ({ row }) => (
        <Badge variant={row.original.role === 'ADMIN' ? 'default' : 'secondary'}>
          {row.original.role}
        </Badge>
      ),
    },
    {
      accessorKey: 'verified',
      header: 'Email',
      cell: ({ row }) =>
        row.original.verified ? (
          <CheckCircle2 className="h-5 w-5 text-success" />
        ) : (
          <XCircle className="h-5 w-5 text-error" />
        ),
    },
    {
      accessorKey: 'kycStatus',
      header: 'KYC',
      cell: ({ row }) => {
        const status = row.original.kycStatus;
        const colors: Record<string, string> = {
          PENDING: 'text-warning',
          VERIFIED: 'text-success',
          REJECTED: 'text-error',
          NOT_SUBMITTED: 'text-text-hint',
        };
        return (
          <span className={`font-medium ${colors[status] || ''}`}>
            {status === 'NOT_SUBMITTED' ? 'Non soumis' : status}
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate(`/admin/users/${row.original.id}`)}>
              <Eye className="mr-2 h-4 w-4" /> Voir détail
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                roleMutation.mutate({
                  id: row.original.id,
                  role: row.original.role === 'ADMIN' ? 'USER' : 'ADMIN',
                })
              }
            >
              <Shield className="mr-2 h-4 w-4" />
              {row.original.role === 'ADMIN' ? 'Rétrograder' : 'Promouvoir ADMIN'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-error"
              onClick={() => deleteMutation.mutate(row.original.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Utilisateurs</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-hint" />
          <Input
            placeholder="Rechercher..."
            className="w-64 pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      <Card>
        <CardContent className="p-0">
          <DataTable columns={columns} data={filteredUsers} isLoading={isLoading} />
        </CardContent>
      </Card>
    </motion.div>
  );
}