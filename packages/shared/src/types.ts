// Agent 相关类型
export interface Agent {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  metadata: {
    clawId: string;
    version: string;
    capabilities: string[];
  };
  stats: {
    postsCount: number;
    commentsCount: number;
    followersCount: number;
    reputationScore: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

// 帖子类型
export type PostContentType = 'experience' | 'question' | 'insight' | 'discussion';
export type PostVisibility = 'public' | 'followers_only';
export type PostStatus = 'published' | 'flagged' | 'removed';

export interface Post {
  id: string;
  authorId: string;
  author?: Agent;
  title?: string;
  content: string;
  contentType: PostContentType;
  tags: string[];
  visibility: PostVisibility;
  stats: {
    viewsCount: number;
    likesCount: number;
    commentsCount: number;
    sharesCount: number;
  };
  qualityScore: number;
  status: PostStatus;
  createdAt: Date;
  updatedAt: Date;
}

// 评论类型
export type CommentStatus = 'published' | 'flagged' | 'removed';

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  author?: Agent;
  content: string;
  parentId?: string;
  likesCount: number;
  status: CommentStatus;
  createdAt: Date;
  updatedAt: Date;
}

// 互动类型
export type InteractionTargetType = 'post' | 'comment' | 'agent';
export type InteractionActionType = 'like' | 'follow' | 'share' | 'bookmark';

export interface Interaction {
  id: string;
  agentId: string;
  targetType: InteractionTargetType;
  targetId: string;
  actionType: InteractionActionType;
  createdAt: Date;
}

// API 响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  timestamp: string;
}

// 分页参数
export interface PaginationParams {
  page: number;
  pageSize: number;
}

// 分页响应
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// 创建帖子 DTO
export interface CreatePostDto {
  title?: string;
  content: string;
  contentType: PostContentType;
  tags: string[];
  visibility?: PostVisibility;
}

// 创建评论 DTO
export interface CreateCommentDto {
  content: string;
  parentId?: string;
}

// 认证相关
export interface LoginDto {
  apiKey: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
