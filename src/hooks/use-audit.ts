import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../api/admin.api';
import { QUERY_KEYS } from '../lib/constants';

export function useAuditLogs() {
  return useQuery({
    queryKey: QUERY_KEYS.ADMIN_AUDIT,
    queryFn: () => adminApi.getAuditLogs().then((r) => r.data),
  });
}