export interface PaginationParams {
  page?: number;
  pageSize?: number;
  limit?: number;
  cursor?: string;
}

export interface SortParams {
  column?: string;
  direction?: 'asc' | 'desc';
}

export interface FilterParams {
  search?: string;
  status?: string;
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  [key: string]: string | undefined;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
  nextCursor?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
}

export type MutationStatus = 'idle' | 'pending' | 'success' | 'error';

export interface UndoItem<T> {
  id: string;
  data: T;
  deletedAt: number;
  timeout: ReturnType<typeof setTimeout>;
}
