export interface PaginatedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface ApiError {
  status: number;
  error: string;
  message: string;
  path: string;
  timestamp: string;
}