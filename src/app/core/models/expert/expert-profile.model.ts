
// ─── User & Expert Profile ────────────────────────────────────────────────────
export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'expert' | 'farmer' | 'buyer' | 'admin';
  isVerified: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
}
 
export interface ExpertProfile {
  _id: string;
  user: string;
  expertiseAreas: string[];
  experienceYears: number;
  bio: string;
  cvPublicId?: string;
  isExpertApproved: boolean;
  expertStatus: 'accepted' | 'pending' | 'rejected';
  createdAt: string;
  updatedAt: string;
}
 
export interface MyInfoResponse {
  user: UserProfile;
  profile: ExpertProfile | null;
  cvUrl: string | null;
}
 
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
  commentCount?: number;   // ✅ صح  isLiked?: boolean;
  isReported?: boolean;
  isDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
}
 
// ─── Tip ──────────────────────────────────────────────────────────────────────
export interface ExpertTip {
  _id: string;
  expert: string | { _id: string; name: string; email: string };
  title: string;
  content: string;
  season?: string;
  cropName?: string;
  soilType?: string[];
  likesCount: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}
 
// ─── Activity (derived) ───────────────────────────────────────────────────────
export interface ActivityItem {
  icon: string;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
  time: string;
}
 
// ─── Profile Tab ──────────────────────────────────────────────────────────────
export type ProfileTab = 'info' | 'posts' | 'tips';
