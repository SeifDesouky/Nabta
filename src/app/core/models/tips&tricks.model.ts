export interface ExpertTipAuthor {
  _id: string;
  name: string;
  email?: string;
}

export interface ExpertTip {
  _id: string;
  expert: ExpertTipAuthor | null;
  title: string;
  content: string;
  cropName?: string;
  soilType?: string[];
  season?: string;
  likesCount: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  isLiked?: boolean; // frontend only
}

export interface GetTipsResponse {
  result: ExpertTip[];
  totalPages: number;
  page: number;
  totalResult: number;
}

export interface CreateTipRequest {
  title: string;
  content: string;
  cropName?: string;
  soilType?: string[];
  season?: string;
}