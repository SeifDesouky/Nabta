export type InteractionType = 'like' | 'save';
export type TargetType = 'Post' | 'ExpertTips';

export interface ToggleInteractionRequest {
  targetId: string;
  targetType: TargetType;
  type: InteractionType;
}

export interface MyInteractionsResponse {
  count: number;
  posts: any[];
  tips: any[];
}
