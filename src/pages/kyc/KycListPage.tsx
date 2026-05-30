import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Avatar } from '../../components/ui/avatar';
import { Input } from '../../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Select } from '../../components/ui/select';
import { DataTable, type Column } from '../../components/ui/data-table';
import { useKycDocuments, useApproveKyc, useRejectKyc } from '../../hooks/use-kyc';
import type { KycDocument } from '../../types/kyc';
import { formatDate, getInitials } from '../../lib/utils';

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'Tous' },
  { value: 'PENDING', label: 'En attente' },
  { value: 'VERIFIED', label: 'Vérifiés' },
  { value: 'REJECTED', label: 'Rejetés' },
];

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'text-warning bg-warning/10',
  VERIFIED: 'text-success bg-success/10',
  REJECTED: 'text-error bg-error/10',
};

export default function KycListPage() {
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [rejectReason, setRejectReason] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<KycDocument | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);

  const { data: docs = [], isLoading } = useKycDocuments(
    statusFilter === 'ALL' ? undefined : statusFilter
  );
  const approveMutation = useApproveKyc();
  const rejectMutation = useRejectKyc();

  const columns: Column<KycDocument>[] = [
    {
      accessorKey: 'user.username',
      header: 'Utilisateur',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8" fallback={getInitials(row.original.user?.username || '?')} />
          <div>
            <p className="font-medium">{row.original.user?.username}</p>
            <p className="text-xs text-text-secondary">{row.original.user?.email}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'documentType',
      header: 'Type',
      enableSorting: true,
    },
    {
      accessorKey: 'status',
      header: 'Statut',
      cell: ({ row }) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[row.original.status] || ''}`}>
          {row.original.status === 'PENDING' ? 'En attente' : row.original.status === 'VERIFIED' ? 'Vérifié' : 'Rejeté'}
        </span>
      ),
    },
    {
      accessorKey: 'submittedAt',
      header: 'Soumis le',
      enableSorting: true,
      cell: ({ row }) => <span className="text-text-secondary">{formatDate(row.original.submittedAt)}</span>,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setSelectedDoc(row.original);
            setDetailOpen(true);
          }}
        >
          Voir
        </Button>
      ),
    },
  ];

  const handleApprove = (docId: string) => {
    approveMutation.mutate(docId);
    setDetailOpen(false);
  };

  const handleReject = () => {
    if (selectedDoc) {
      rejectMutation.mutate({ documentId: selectedDoc.id, reason: rejectReason });
      setDetailOpen(false);
      setRejectOpen(false);
      setRejectReason('');
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text-primary">🪪 Vérifications KYC</h1>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={STATUS_OPTIONS}
          className="w-44"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <DataTable columns={columns} data={docs} isLoading={isLoading} />
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Document KYC — {selectedDoc?.user?.username}
            </DialogTitle>
          </DialogHeader>
          {selectedDoc && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-text-secondary">Document soumis</label>
                <div className="mt-1 rounded border border-border bg-surface-variant p-2">
                  <img
                    src={selectedDoc.fileUrl}
                    alt="Document KYC"
                    className="rounded max-h-96 mx-auto object-contain"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-text-secondary">Type</label>
                  <p className="text-text-primary">{selectedDoc.documentType}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-text-secondary">Soumis le</label>
                  <p className="text-text-primary">{formatDate(selectedDoc.submittedAt)}</p>
                </div>
              </div>
              {selectedDoc.status === 'REJECTED' && selectedDoc.rejectionReason && (
                <div>
                  <label className="text-sm font-medium text-error">Motif du rejet</label>
                  <p className="text-error">{selectedDoc.rejectionReason}</p>
                </div>
              )}
              {selectedDoc.status === 'PENDING' && (
                <div className="flex gap-2 justify-end pt-4">
                  <Button variant="destructive" onClick={() => setRejectOpen(true)}>Refuser</Button>
                  <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Motif du refus</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Input
                          placeholder="Document illisible, informations non concordantes..."
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                        />
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setRejectOpen(false)}>
                            Annuler
                          </Button>
                          <Button variant="destructive" onClick={handleReject}>
                            Confirmer le refus
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button onClick={() => handleApprove(selectedDoc.id)}>Approuver</Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}