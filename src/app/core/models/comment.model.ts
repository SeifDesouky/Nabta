export interface Comment {
  _id: string;
  post: string;
  author: CommentAuthor | null;
  content: string;
  isExpertReply: boolean;
  parentComment: string | null;
  replies?: Comment[];
  createdAt: string;
}

export interface CommentAuthor {
  _id: string;
  name: string | null;
  imageUrl?: string;
  role?: string;
}

export interface CreateCommentRequest {
  post: string;
  content: string;
  parentComment?: string | null;
}
