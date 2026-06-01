import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { ZoomIn, ZoomOut, Download, Check, X } from 'lucide-react';
import { api } from '../../api/client';
import { API_BASE_URL } from '../../config/api';
import { formatDate } from '../../lib/utils';

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

interface Props {
  docId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove: (docId: string) => void;
  onReject: (docId: string) => void;
}

function getFileUrl(relativePath: string): string {
  if (relativePath.startsWith('http')) return relativePath;
  return `${API_BASE_URL}${relativePath}`;
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-text-secondary">{label}</p>
      <p className="text-sm text-text-primary mt-0.5">{children}</p>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  if (status === 'VERIFIED')
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-success/10 text-success px-2.5 py-0.5 text-xs font-semibold">
        ✓ Vérifié
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
      <span className="inline-flex items-center gap-1 rounded-full bg-error/10 text-error px-2.5 py-0.5 text-xs font-semibold">
        ✗ Rejeté
      </span>
    );
  return null;
}

export function KycDetailDialog({ docId, open, onOpenChange, onApprove, onReject }: Props) {
  const [zoom, setZoom] = useState(1);

  const { data: docs } = useQuery({
    queryKey: ['admin-kyc', 'all'],
    queryFn: async () => (await api.get<KycDocument[]>('/kyc/all')).data,
    enabled: open,
  });

  const doc = docs?.find((d) => d.id === docId);

  if (!doc) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <div className="py-12 text-center">
            <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const fileUrl = getFileUrl(doc.fileUrl);
  const docLabel =
    doc.documentType === 'ID_CARD'
      ? "Carte d'identité"
      : doc.documentType === 'PASSPORT'
      ? 'Passeport'
      : 'Autre';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[90vh] p-0" showClose>
        <div className="grid grid-cols-1 md:grid-cols-3 h-full">
          {/* Image viewer */}
          <div className="md:col-span-2 bg-black/95 flex flex-col items-center justify-center relative p-4">
            <div className="flex-1 flex items-center justify-center overflow-auto w-full min-h-0">
              <img
                src={fileUrl}
                alt="KYC document"
                className="max-w-full max-h-full object-contain transition-transform"
                style={{ transform: `scale(${zoom})` }}
              />
            </div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-black/70 backdrop-blur rounded-full px-2 py-1.5 shadow-lg">
              <button
                className="text-white p-1.5 hover:bg-white/10 rounded-full transition-colors"
                onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
                title="Dézoomer"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <span className="text-white text-xs font-medium min-w-[44px] text-center tabular-nums">
                {Math.round(zoom * 100)}%
              </span>
              <button
                className="text-white p-1.5 hover:bg-white/10 rounded-full transition-colors"
                onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
                title="Zoomer"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
              <div className="w-px h-5 bg-white/20 mx-1" />
              <a
                href={fileUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="text-white p-1.5 hover:bg-white/10 rounded-full transition-colors inline-flex"
                title="Télécharger"
              >
                <Download className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Sidebar */}
          <div className="p-6 space-y-5 overflow-y-auto bg-surface">
            <DialogHeader>
              <DialogTitle className="text-text-primary">Document KYC</DialogTitle>
              <DialogDescription>
                Vérifiez l'authenticité du document
              </DialogDescription>
            </DialogHeader>

            {doc.user && (
              <div className="p-3 rounded-lg bg-surface-variant/50 border border-border">
                <p className="text-xs text-text-secondary">Utilisateur</p>
                <p className="text-sm font-medium text-text-primary">
                  {doc.user.firstName} {doc.user.lastName}
                </p>
                <p className="text-xs text-text-secondary">{doc.user.email}</p>
              </div>
            )}

            <div className="space-y-3">
              <InfoRow label="ID document">
                <span className="font-mono text-xs break-all">{doc.id}</span>
              </InfoRow>
              <InfoRow label="Type de document">{docLabel}</InfoRow>
              <InfoRow label="Soumis le">{formatDate(doc.submittedAt)}</InfoRow>
              <div>
                <p className="text-xs text-text-secondary mb-1">Statut</p>
                <StatusPill status={doc.status} />
              </div>
              {doc.rejectionReason && (
                <div>
                  <p className="text-xs text-text-secondary mb-1">Motif du rejet</p>
                  <p className="text-sm bg-error/5 border border-error/20 rounded-lg p-2.5 text-error">
                    {doc.rejectionReason}
                  </p>
                </div>
              )}
            </div>

            {doc.status === 'PENDING' && (
              <div className="space-y-2 pt-4 border-t border-border">
                <Button
                  className="w-full bg-success hover:bg-success/90 text-white"
                  onClick={() => onApprove(doc.id)}
                >
                  <Check className="h-4 w-4 mr-2" /> Approuver
                </Button>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => onReject(doc.id)}
                >
                  <X className="h-4 w-4 mr-2" /> Rejeter
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
