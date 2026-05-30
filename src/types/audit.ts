export type ActionType =
  | 'REGISTER'
  | 'LOGIN'
  | 'KYC_SUBMITTED'
  | 'KYC_APPROVED'
  | 'KYC_REJECTED'
  | 'PAYMENT_INITIATED'
  | 'PAYMENT_CONFIRMED'
  | 'SUBMIT_RATING'
  | 'CREATE_JOB'
  | 'ASSIGN_JOB'
  | 'COMPLETE_JOB'
  | 'SEND_MESSAGE';

export interface ActionLog {
  id: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
  action: ActionType;
  details: string;
  timestamp: string;
}