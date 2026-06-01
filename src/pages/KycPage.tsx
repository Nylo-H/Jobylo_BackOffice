import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
  Eye,
  Check,
  X,
  Search,
  FileCheck,
  Inbox,
  ShieldCheck,
  ShieldX,
} from 'lucide-react';
import { api } from '../api/client';
import { KycDetailDialog } from '../components/admin/KycDetailDialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { toast } from 'sonner';
import { API_BASE_URL } from '../config/api';
import { formatDate } from '../lib/utils';
import { getApiErrorMessage } from '../lib/errors';

interface KycDocument {
  id: string;
  userId: string;
  user?: { id: string; username: string; email: string; firstName: string; lastName: string };
  fileUrl: string;
  documentType: 'ID_CARD' | 'PASSPORT' | 'OTHER';
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  verifiedById?: string | null;
  submittedAt: string;
  rejectionReason: string | null;
}

function getFileUrl(relativePath: string): string {
  if (relativePath.startsWith('http')) return relativePath;
  return `${API_BASE_URL}${relativePath}`;
}

function KycStatusBadge({ status, reason }: { status: string; reason: string | null }) {
  if (status === 'VERIFIED')
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-success/10 text-success px-2.5 py-0.5 text-xs font-semibold">
        <ShieldCheck className="h-3 w-3" /> Vérifié
      </span>
    );
  if (status === 'PENDING')
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 text-warning px-2.5 py-0.5 text-xs font-semibold">
        <span className="h-1.5 w-1.5 rounded-full bg-warning animate-pulse" /> En attente
      </span>
    );
  if (status === 'REJECTED')
    return (
      <div className="space-y-1">
        <span className="inline-flex items-center gap-1 rounded-full bg-error/10 text-error px-2.5 py-0.5 text-xs font-semibold">
          <ShieldX className="h-3 w-3" /> Rejeté
        </span>
        {reason && <p className="text-xs text-text-secondary italic">"{reason}"</p>}
      </div>
    );
  return null;
}

const STATUS_TABS = [
  { value: 'PENDING', label: 'En attente', icon: FileCheck },
  { value: 'VERIFIED', label: 'Vérifiés', icon: ShieldCheck },
  { value: 'REJECTED', label: 'Rejetés', icon: ShieldX },
  { value: 'all', label: 'Tous', icon: Inbox },
] as const;

export default function KycPage() {
  const [statusFilter, setStatusFilter] = useState<'all' | 'PENDING' | 'VERIFIED' | 'REJECTED'>('PENDING');
  const [search, setSearch] = useState('');
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [rejectDocId, setRejectDocId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const queryClient = useQueryClient();

  const { data: docs = [], isLoading } = useQuery({
    queryKey: ['admin-kyc', statusFilter],
    queryFn: async () => {
      const url = statusFilter === 'all' ? '/kyc/all' : `/kyc/all?status=${statusFilter}`;
      return (await api.get<KycDocument[]>(url)).data;
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (docId: string) => (await api.post(`/kyc/${docId}/approve`)).data,
    onSuccess: () => {
      toast.success('KYC approuvé avec succès');
      queryClient.invalidateQueries({ queryKey: ['admin-kyc'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      setSelectedDocId(null);
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Erreur')),
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ docId, reason }: { docId: string; reason: string }) =>
      (await api.post(`/kyc/${docId}/reject`, { reason })).data,
    onSuccess: () => {
      toast.success('KYC rejeté');
      queryClient.invalidateQueries({ queryKey: ['admin-kyc'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      setSelectedDocId(null);
      setRejectDocId(null);
      setRejectReason('');
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Erreur')),
  });

  const filtered = docs.filter((d) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      d.user?.firstName?.toLowerCase().includes(q) ||
      d.user?.lastName?.toLowerCase().includes(q) ||
      d.user?.email?.toLowerCase().includes(q) ||
      d.id.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Vérification KYC</h1>
          <p className="text-text-secondary text-sm mt-1">
            Approuvez ou rejetez les documents d'identité
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="inline-flex rounded-lg border border-border p-1 bg-surface-variant">
          {STATUS_TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  statusFilter === tab.value
                    ? 'bg-surface text-text-primary shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-text-hint" />
          <input
            placeholder="Rechercher un utilisateur..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex h-9 w-full rounded-md border border-border bg-white pl-10 pr-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-text-secondary mt-3">Chargement des documents...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-16 text-center">
              <FileCheck className="h-12 w-12 text-text-hint mx-auto mb-3" />
              <p className="text-text-primary font-medium">Aucun document à traiter</p>
              <p className="text-sm text-text-secondary mt-1">
                {search
                  ? 'Aucun résultat ne correspond à votre recherche'
                  : 'Aucun document dans cette catégorie pour le moment'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface-variant">
                  <tr>
                    <th className="text-left p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                      Document
                    </th>
                    <th className="text-left p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                      Type
                    </th>
                    <th className="text-left p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                      Soumis le
                    </th>
                    <th className="text-left p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="text-right p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((doc) => (
                    <motion.tr
                      key={doc.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-t border-border hover:bg-surface-variant/50 transition-colors"
                    >
                      <td className="p-4">
                        <button
                          onClick={() => setSelectedDocId(doc.id)}
                          className="flex items-center gap-3 text-left group"
                        >
                          <div className="relative shrink-0">
                            <img
                              src={getFileUrl(doc.fileUrl)}
                              alt="KYC"
                              className="h-12 w-12 object-cover rounded-lg border border-border group-hover:border-primary transition-colors"
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-text-primary group-hover:text-primary transition-colors">
                              {doc.user
                                ? `${doc.user.firstName} ${doc.user.lastName}`
                                : `User ${doc.userId.slice(0, 8)}…`}
                            </div>
                            <div className="text-xs text-text-secondary truncate">
                              {doc.user?.email ?? `Doc #${doc.id.slice(0, 8)}`}
                            </div>
                          </div>
                        </button>
                      </td>
                      <td className="p-4 text-sm text-text-primary">
                        {doc.documentType === 'ID_CARD'
                          ? "🪪 Carte d'identité"
                          : doc.documentType === 'PASSPORT'
                          ? '📕 Passeport'
                          : '📄 Autre'}
                      </td>
                      <td className="p-4 text-sm text-text-secondary whitespace-nowrap">
                        {formatDate(doc.submittedAt)}
                      </td>
                      <td className="p-4">
                        <KycStatusBadge status={doc.status} reason={doc.rejectionReason} />
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedDocId(doc.id)}
                            title="Voir le document"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {doc.status === 'PENDING' && (
                            <>
                              <Button
                                size="sm"
                                className="bg-success hover:bg-success/90 text-white"
                                onClick={() => approveMutation.mutate(doc.id)}
                                title="Approuver"
                                disabled={approveMutation.isPending}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  setRejectDocId(doc.id);
                                  setRejectReason('');
                                }}
                                title="Rejeter"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedDocId && (
        <KycDetailDialog
          docId={selectedDocId}
          open={!!selectedDocId}
          onOpenChange={(o) => !o && setSelectedDocId(null)}
          onApprove={(id) => approveMutation.mutate(id)}
          onReject={(id) => {
            setSelectedDocId(null);
            setRejectDocId(id);
          }}
        />
      )}

      <Dialog
        open={!!rejectDocId}
        onOpenChange={(o) => {
          if (!o) {
            setRejectDocId(null);
            setRejectReason('');
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <X className="h-5 w-5 text-error" /> Rejeter le document KYC
            </DialogTitle>
            <DialogDescription>
              Indiquez le motif du rejet. Il sera visible par l'utilisateur.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary block">Motif du rejet *</label>
            <textarea
              autoFocus
              rows={4}
              placeholder="Ex: Document flou, expiré, falsifié..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectDocId(null);
                setRejectReason('');
              }}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              disabled={!rejectReason.trim() || rejectMutation.isPending}
              onClick={() => rejectDocId && rejectMutation.mutate({ docId: rejectDocId, reason: rejectReason.trim() })}
            >
              {rejectMutation.isPending ? 'Rejet...' : 'Confirmer le rejet'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
