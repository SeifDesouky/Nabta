// ─── Base User ────────────────────────────────────────────────────────────────
export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'farmer' | 'expert' | 'buyer' | 'admin';
  isVerified: boolean;
  isDeleted: boolean;
  status: 'active' | 'blocked' | 'pending';
  createdAt: string;
  updatedAt: string;
}

// ─── API Responses ────────────────────────────────────────────────────────────
export interface PaginatedResponse<T> {
  page: number;
  limit: number;
  totalPages: number;
  totalResult: number;
  result: T[];
}

export interface UserStatsResponse {
  total: number;
  farmer?: number;
  expert?: number;
  buyer?: number;
  admin?: number;
}

export interface ToggleStatusResponse {
  message: string;
  data: User;
}

export interface DeleteUserResponse {
  _id: string;
  isDeleted: boolean;
  status: string;
}

// ─── UI Filters ───────────────────────────────────────────────────────────────
export type RoleFilter   = 'all' | 'farmer' | 'expert' | 'buyer';
export type StatusFilter = 'all' | 'active' | 'blocked' | 'pending';

export interface UserFilters {
  role:   RoleFilter;
  status: StatusFilter;
  search: string;
}

// ─── Role / Status display helpers ───────────────────────────────────────────
export interface RoleDisplay {
  label: string;
  icon:  string;
  color: string;
  bg:    string;
}

export interface StatusDisplay {
  label: string;
  dot:   string;
  color: string;
}