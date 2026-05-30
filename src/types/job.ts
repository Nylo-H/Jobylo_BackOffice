export type JobStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface Job {
  id: string;
  title: string;
  description: string;
  budget: number;
  status: JobStatus;
  client: {
    id: string;
    username: string;
  };
  freelancer?: {
    id: string;
    username: string;
  };
  category?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}