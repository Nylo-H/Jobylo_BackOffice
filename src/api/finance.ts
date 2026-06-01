import { api } from './client';

export interface MonthlyRevenue {
  year: number;
  month: number;
  volume: number;
  commission: number;
}

export interface FinanceStatsResponse {
  totalVolume: number;
  heldAmount: number;
  totalCommissionCollected: number;
  totalPaidToWorkers: number;
  totalTransactions: number;
  completedTransactions: number;
  heldTransactions: number;
  cancelledTransactions: number;
  averageTransactionAmount: number;
  revenueByMonth: MonthlyRevenue[];
}

export const financeApi = {
  getStats: () =>
    api.get<FinanceStatsResponse>('/admin/finance').then((r) => r.data),
};