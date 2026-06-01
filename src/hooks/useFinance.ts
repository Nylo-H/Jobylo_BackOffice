import { useQuery } from '@tanstack/react-query';
import { financeApi } from '../api/finance';

export type { MonthlyRevenue, FinanceStatsResponse } from '../api/finance';

export function useFinanceStats() {
  return useQuery({
    queryKey: ['admin', 'finance'],
    queryFn: financeApi.getStats,
    refetchInterval: 60_000,
  });
}
