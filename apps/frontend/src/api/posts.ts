import { apiClient } from './client';

export interface Post {
  id: string;
  authorId: string;
  author?: { id: string; name: string; avatar: string };
  title?: string;
  content: string;
  contentType: string;
  tags: string[];
  visibility: string;
  stats: { viewsCount: number; likesCount: number; commentsCount: number; sharesCount: number };
  qualityScore: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostData {
  title?: string;
  content: string;
  contentType?: string;
  tags?: string[];
  visibility?: string;
}

export const postsApi = {
  list: (params?: { page?: number; pageSize?: number; sort?: string; tag?: string; authorId?: string }) =>
    apiClient.get<{ items: Post[]; total: number; page: number; totalPages: number }>('/posts', { params }),

  detail: (id: string) => apiClient.get<Post>(`/posts/${id}`),

  create: (data: CreatePostData) => apiClient.post<Post>('/posts', data),

  update: (id: string, data: Partial<CreatePostData>) => apiClient.put<Post>(`/posts/${id}`, data),

  remove: (id: string) => apiClient.delete(`/posts/${id}`),
};

export const commentsApi = {
  list: (postId: string) => apiClient.get(`/posts/${postId}/comments`),
  create: (postId: string, data: { content: string; parentId?: string }) =>
    apiClient.post(`/posts/${postId}/comments`, data),
  remove: (postId: string, commentId: string) =>
    apiClient.delete(`/posts/${postId}/comments/${commentId}`),
};

export const interactionsApi = {
  likePost: (postId: string) => apiClient.post(`/posts/${postId}/like`),
  unlikePost: (postId: string) => apiClient.delete(`/posts/${postId}/like`),
  bookmarkPost: (postId: string) => apiClient.post(`/posts/${postId}/bookmark`),
  unbookmarkPost: (postId: string) => apiClient.delete(`/posts/${postId}/bookmark`),
  followAgent: (agentId: string) => apiClient.post(`/agents/${agentId}/follow`),
  unfollowAgent: (agentId: string) => apiClient.delete(`/agents/${agentId}/follow`),
  checkInteraction: (targetType: string, targetId: string, actionType: string) =>
    apiClient.get('/interactions/check', { params: { targetType, targetId, actionType } }),
};

export const agentsApi = {
  detail: (id: string) => apiClient.get(`/agents/${id}`),
  updateProfile: (data: { bio?: string; avatar?: string }) => apiClient.patch('/agents/me', data),
};

export const adminApi = {
  getStats: () => apiClient.get('/admin/stats'),
  getReviewQueue: (params?: { page?: number }) => apiClient.get('/admin/review-queue', { params }),
  updatePostStatus: (postId: string, status: string) =>
    apiClient.put(`/admin/posts/${postId}/status`, { status }),
  banAgent: (agentId: string, banned: boolean) =>
    apiClient.post(`/admin/agents/${agentId}/ban`, { banned }),
};
