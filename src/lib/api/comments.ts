import { api } from "./axios";

export interface Comment {
  _id: string;
  content: string;
  pageId: string;
  author: {
    _id: string;
    username: string;
    email: string;
  };
  parentComment?: string;
  likes: string[];
  dislikes: string[];
  createdAt: string;
  updatedAt: string;
  replies?: Comment[];
}

export interface CreateCommentData {
  content: string;
  pageId: string;
  parentCommentId?: string;
}

export interface UpdateCommentData {
  content: string;
}

export interface PaginationData {
  page: number;
  limit: number;
  totalPages: number;
  totalComments: number;
}

export interface CommentsResponse {
  success: boolean;
  data: Comment[];
  pagination: PaginationData;
}

// Backend response structure
interface BackendCommentsResponse {
  status: string;
  message: string;
  meta: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
  data: Comment[];
}

export type SortOption = "newest" | "mostLiked" | "mostDisliked";

export const commentsApi = {
  getComments: async (
    pageId: string,
    page: number = 1,
    limit: number = 10,
    sort: SortOption = "newest"
  ): Promise<CommentsResponse> => {
    const response = await api.get<BackendCommentsResponse>(
      `/comments/${pageId}?page=${page}&limit=${limit}&sort=${sort}`
    );

    // Transform backend response to frontend format
    return {
      success: response.data.status === "success",
      data: response.data.data,
      pagination: {
        page: response.data.meta.currentPage,
        limit: response.data.meta.pageSize,
        totalPages: response.data.meta.totalPages,
        totalComments: response.data.meta.totalItems,
      },
    };
  },

  createComment: async (
    data: CreateCommentData
  ): Promise<{ success: boolean; data: Comment }> => {
    const response = await api.post<{ success: boolean; data: Comment }>(
      "/comments",
      data
    );
    return response.data;
  },

  updateComment: async (
    commentId: string,
    data: UpdateCommentData
  ): Promise<{ success: boolean; data: Comment }> => {
    const response = await api.put<{ success: boolean; data: Comment }>(
      `/comments/${commentId}`,
      data
    );
    return response.data;
  },

  deleteComment: async (
    commentId: string
  ): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete<{ success: boolean; message: string }>(
      `/comments/${commentId}`
    );
    return response.data;
  },

  likeComment: async (
    commentId: string
  ): Promise<{ success: boolean; data: Comment }> => {
    const response = await api.post<{ success: boolean; data: Comment }>(
      `/comments/${commentId}/like`
    );
    return response.data;
  },

  dislikeComment: async (
    commentId: string
  ): Promise<{ success: boolean; data: Comment }> => {
    const response = await api.post<{ success: boolean; data: Comment }>(
      `/comments/${commentId}/dislike`
    );
    return response.data;
  },

  getReplies: async (
    commentId: string
  ): Promise<{ success: boolean; data: Comment[] }> => {
    const response = await api.get<{ success: boolean; data: Comment[] }>(
      `/comments/${commentId}/replies`
    );
    return response.data;
  },
};
