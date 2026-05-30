export const API_BASE_URL = 'http://localhost:8080/api';

export const QUERY_KEYS = {
  // Auth
  AUTH_ME: ['auth', 'me'] as const,
  // Admin
  ADMIN_STATS: ['admin', 'stats'] as const,
  ADMIN_USERS: ['admin', 'users'] as const,
  ADMIN_USER: (id: string) => ['admin', 'users', id] as const,
  ADMIN_KYC: (status?: string) => ['admin', 'kyc', status] as const,
  ADMIN_AUDIT: ['admin', 'audit'] as const,
  ADMIN_JOBS: ['admin', 'jobs'] as const,
  ADMIN_CATEGORIES: ['admin', 'categories'] as const,
  ADMIN_TRANSACTIONS: ['admin', 'transactions'] as const,
} as const;

export const ACTION_TYPES = [
  { value: 'REGISTER', label: 'Inscription', icon: 'UserPlus' },
  { value: 'LOGIN', label: 'Connexion', icon: 'LogIn' },
  { value: 'KYC_SUBMITTED', label: 'KYC soumis', icon: 'FileText' },
  { value: 'KYC_APPROVED', label: 'KYC approuvé', icon: 'CheckCircle' },
  { value: 'KYC_REJECTED', label: 'KYC rejeté', icon: 'XCircle' },
  { value: 'PAYMENT_INITIATED', label: 'Paiement initié', icon: 'CreditCard' },
  { value: 'PAYMENT_CONFIRMED', label: 'Paiement confirmé', icon: 'Check' },
  { value: 'SUBMIT_RATING', label: 'Notation', icon: 'Star' },
  { value: 'CREATE_JOB', label: 'Création mission', icon: 'Briefcase' },
  { value: 'ASSIGN_JOB', label: 'Attribution mission', icon: 'UserCheck' },
  { value: 'COMPLETE_JOB', label: 'Mission terminée', icon: 'CheckCircle2' },
  { value: 'SEND_MESSAGE', label: 'Message', icon: 'MessageSquare' },
] as const;