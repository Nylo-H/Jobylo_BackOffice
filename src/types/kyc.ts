import type { KycStatus } from './user';

export interface KycDocument {
  id: string;
  userId: string;
  user?: {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  documentType: string;
  fileUrl: string;
  status: KycStatus;
  rejectionReason?: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}