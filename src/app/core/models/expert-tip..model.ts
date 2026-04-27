export interface ExpertTip {
  _id: string;
  expert: TipAuthor;
  title: string;
  content: string;
  cropName?: string;
  soilType?: string[];
  season?: string;
  likesCount: number;
  createdAt: string;
  isLiked?: boolean; // frontend only
}

export interface TipAuthor {
  _id: string;
  name: string;
  imageUrl?: string;
}

export interface CreateTipRequest {
  title: string;
  content: string;
  cropName?: string;
  soilType?: string[];
  season?: string;
}
