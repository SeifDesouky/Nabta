export type GuideType = 'article' | 'video' | 'tutorial';

export interface GuideAuthor {
  _id: string;
  name: string;
}

export interface Guide {
  _id: string;
  author: GuideAuthor;
  title: string;
  content: string;
  guide_type: GuideType;
  category: string;
  tags: string[];
  coverUrl: string;
  imageUrl:string[]
  videoUrl?: string;
  likesCount: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GetGuidesResponse {
  result: Guide[];
  totalPages: number;
  page: number;
  totalResult: number;
}

export interface GuideFilters {
  type?: GuideType;
  page?: number;
  limit?: number;
  search?: string;
}
