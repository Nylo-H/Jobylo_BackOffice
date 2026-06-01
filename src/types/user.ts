export type KycStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: 'USER' | 'ADMIN';
  verified: boolean;
  kycStatus: KycStatus | null;
  photoProfile?: string | null;
  averageRating?: number | null;
  totalRatings?: number | null;
  createdAt?: string;
}

export interface LoginResponse {
  accesstoken: string;
  refreshtoken: string;
  verified: boolean;
}

export interface AdminStats {
  totalUsers: number;
  verifiedUsers: number;
  kycPending: number;
  kycVerified: number;
  kycRejected: number;
  jobsPending: number;
  jobsInProgress: number;
  jobsDone: number;
  jobsExpired: number;
  transactionsHeld: number;
  transactionsCompleted: number;
  transactionsCancelled: number;
  totalApplications: number;
  applicationsPending: number;
  totalAuditLogs: number;
}

export type AdminUserResponse = User;

export type AdminStatsResponse = AdminStats;