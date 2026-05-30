import api from './client';
import type { AdminStats, AdminUserResponse, User } from '../types/user';
import type { KycDocument } from '../types/kyc';
import type { ActionLog } from '../types/audit';
import type { Job } from '../types/job';

export const adminApi = {
  // Stats
  getStats: () => api.get<AdminStats>('/admin/stats'),

  // Users
  getUsers: () => api.get<User[]>('/admin/users'),
  getUser: (id: string) => api.get<AdminUserResponse>(`/admin/users/${id}`),
  updateUser: (id: string, data: Partial<User>) => api.put<User>(`/admin/users/${id}`, data),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
  updateUserRole: (id: string, role: 'ADMIN' | 'USER') =>
    api.patch<User>(`/admin/users/${id}/role`, { role }),

  // KYC
  getKycDocuments: (status?: string) =>
    api.get<KycDocument[]>('/kyc/all', { params: status ? { status } : {} }),
  approveKyc: (documentId: string) => api.post<KycDocument>(`/kyc/${documentId}/approve`),
  rejectKyc: (documentId: string, reason?: string) =>
    api.post<KycDocument>(`/kyc/${documentId}/reject`, { rejectionReason: reason }),

  // Audit
  getAuditLogs: () => api.get<ActionLog[]>('/audit'),

  // Jobs
  getJobs: (status?: string, q?: string) =>
    api.get<Job[]>('/admin/jobs', { params: { status, q } }),

  // Transactions
  getTransactions: (status?: string) =>
    api.get('/admin/transactions', { params: status ? { status } : {} }),
};