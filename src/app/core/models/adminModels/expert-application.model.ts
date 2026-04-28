// ─── Base User ───────────────────────────────────────────────────────────────
export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'farmer' | 'expert' | 'buyer' | 'admin';
  isVerified: boolean;
  status: 'active' | 'blocked' | 'pending' | 'rejected';
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Expert Profile ───────────────────────────────────────────────────────────
export interface ExpertProfile {
  _id: string;
  user: User;
  expertiseAreas: string[];
  experienceYears: number;
  bio: string;
  cvPublicId?: string;
  isExpertApproved: boolean;
  expertStatus: 'accepted' | 'pending' | 'rejected';
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

export interface ExpertStatsResponse {
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
}

export interface ManageExpertPayload {
  action: 'approve' | 'reject';
}

export interface ManageExpertResponse {
  message: string;
}

// ─── UI State ─────────────────────────────────────────────────────────────────
export type FilterStatus = 'all' | 'pending' | 'accepted' | 'rejected';

export interface ExpertApplicationsState {
  experts: ExpertProfile[];
  stats: ExpertStatsResponse;
  loading: boolean;
  statsLoading: boolean;
  actionLoading: Set<string>;
  currentPage: number;
  totalPages: number;
  totalResult: number;
  limit: number;
  activeFilter: FilterStatus;
  searchQuery: string;
  selectedExpert: ExpertProfile | null;
  modalOpen: boolean;
}
