export type Role = 'ADMIN' | 'USER';
export type KycStatus = 'PENDING' | 'VERIFIED' | 'REJECTED' | 'NOT_SUBMITTED';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: Role;
  verified: boolean;
  kycStatus: KycStatus;
  photoProfil?: string | null;
  averageRating?: number | null;
  totalRatings?: number | null;
  createdAt: string;
}

export interface LoginResponse {
  accesstoken: string;
  refreshtoken: string;
  verified: boolean;
}

export interface MeResponse {
  id: string;
  username: string;
  email: string;
  role: Role;
  verified: boolean;
  kycStatus: KycStatus;
  photoProfil?: string | null;
  averageRating?: number | null;
  totalRatings?: number | null;
}

export interface AdminUserResponse extends User {
  averageRating: number;
  totalRatings: number;
  lastSeenAt: string;
  totalJobsCreated: number;
  totalJobsCompleted: number;
  totalTransactions: number;
}

export interface AdminStats {
  totalUsers: number;
  totalJobs: number;
  pendingKyc: number;
  completedTransactions: number;
  totalRevenue: number;
  activeUsersToday: number;
}