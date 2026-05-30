import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../api/admin.api';
import { QUERY_KEYS } from '../lib/constants';
import { toast } from 'sonner';

export function useKycDocuments(status?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.ADMIN_KYC(status),
    queryFn: () => adminApi.getKycDocuments(status).then((r) => r.data),
  });
}

export function useApproveKyc() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (documentId: string) => adminApi.approveKyc(documentId).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'kyc'] });
      toast.success('KYC approuvé avec succès');
    },
  });
}

export function useRejectKyc() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ documentId, reason }: { documentId: string; reason: string }) =>
      adminApi.rejectKyc(documentId, reason).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'kyc'] });
      toast.success('KYC refusé');
    },
  });
}