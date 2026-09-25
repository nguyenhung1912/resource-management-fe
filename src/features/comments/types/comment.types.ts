export interface MessageResponse {
  message: string;
}

export interface CommentItemResponse {
  commentId: string;
  fileId: string;
  uid: string;
  authorName: string;
  authorRole: string;
  content: string;
  parentCommentId: string | null;
  parentAuthorName?: string | null;
  likeCount: number;
  replyCount: number;
  isLiked: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface CommentTreeNode extends CommentItemResponse {
  depth: number;
  children?: CommentTreeNode[];
}

export interface CommentTreeConfig {
  maxVisualDepth?: number;
}

export interface PagedCommentResponse {
  items: CommentItemResponse[];
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface CreateCommentRequest {
  fileId: string;
  content: string;
  parentCommentId?: string | null;
}

export interface UpdateCommentRequest {
  content: string;
}

export interface CommentMutationResponse {
  message: string;
  data: CommentItemResponse;
}

export interface CommentFilterQuery {
  pageIndex?: number;
  pageSize?: number;
  parentId?: string;
}
