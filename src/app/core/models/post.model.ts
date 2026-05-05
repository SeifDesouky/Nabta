export interface Post {
  _id: string;
  author: PostAuthor | null;
  title?: string;
  content: string;
  tags: string[];
  likesCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
  isLiked?: boolean; // frontend only
}

export interface PostAuthor {
  _id: string;
  name: string;
  imageUrl?: string;
  role?: string;
}

export interface CreatePostRequest {
  title?: string;
  content: string;
  tags?: string[];
}

export interface UpdatePostRequest {
  title?: string;
  content?: string;
  tags?: string[];
}

