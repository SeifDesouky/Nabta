// ─── Post ─────────────────────────────────────────────────────────────────────
export interface PostAuthor {
  _id: string;
  name: string;
  imageUrl?: string;
  role: string;
}

export interface Post {
  _id: string;
  author: PostAuthor;
  title: string;
  content: string;
  tags?: string[];
  likesCount: number;
  commentCount?: number;
  isLiked?: boolean;
  isReported?: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Comment ──────────────────────────────────────────────────────────────────
export interface CommentAuthor {
  _id: string;
  name: string;
  imageUrl?: string;
  role: string;
}

export interface Comment {
  _id: string;
  author: CommentAuthor;
  post: string;
  content: string;
  parentComment?: string | null;
  isExpertReply?: boolean;
  replies?: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentRequest {
  post: string;
  content: string;
  parentComment?: string;
}

// ─── Interaction ──────────────────────────────────────────────────────────────
export type InteractionType = 'like' | 'save';
export type TargetType = 'Post' | 'ExpertTips' | 'Guide';

export interface ToggleInteractionRequest {
  targetId: string;
  targetType: TargetType;
  type: InteractionType;
}

// ─── UI State ─────────────────────────────────────────────────────────────────
export type ConsultationView = 'list' | 'detail';

export interface PostWithUI extends Post {
  showComments?: boolean;
  comments?: Comment[];
  commentsLoading?: boolean;
  replyText?: string;
}