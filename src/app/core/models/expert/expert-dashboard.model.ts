// ─── Post ─────────────────────────────────────────────────────────────────────
export interface PostAuthor {
  _id: string;
  name: string;
  role: string;
}

export interface Post {
  _id: string;
  author: PostAuthor;
  title: string;
  content: string;
  images?: string[];
  likesCount: number;
  commentsCount?: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostRequest {
  title: string;
  content: string;
  images?: string[];
}

export interface UpdatePostRequest {
  title?: string;
  content?: string;
}

// ─── Comment ──────────────────────────────────────────────────────────────────
export interface CommentAuthor {
  _id: string;
  name: string;
  role: string;
}

export interface Comment {
  _id: string;
  author: CommentAuthor;
  post: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentRequest {
  post: string;
  content: string;
}

// ─── Interaction ──────────────────────────────────────────────────────────────
export type InteractionType = 'like' | 'save';
export type TargetType      = 'Post' | 'ExpertTips' | 'Guide';

export interface ToggleInteractionRequest {
  targetId:   string;
  targetType: TargetType;
  type:       InteractionType;
}

export interface MyInteractionsResponse {
  result: Array<{
    _id:        string;
    targetId:   string;
    targetType: TargetType;
    type:       InteractionType;
  }>;
}

// ─── Dashboard UI ─────────────────────────────────────────────────────────────
export interface DashboardStats {
  activeConsultations: number;
  pendingQuestions:    number;
  averageRating:       number;
  totalEarnings:       number;
  farmersHelped:       number;
  solvedCases:         number;
}

export interface ScheduledConsultation {
  id:       string;
  farmer:   string;
  subject:  string;
  date:     string;
  month:    string;
  day:      number;
  time:     string;
  type:     'video' | 'call';
  priority: 'primary' | 'tertiary';
}

export interface RecentInquiry {
  initials: string;
  name:     string;
  subject:  string;
  priority: 'high' | 'medium' | 'low';
  time:     string;
}