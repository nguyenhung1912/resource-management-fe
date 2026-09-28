import axiosClient from '@/services/axiosClient';
import type {
  AddKeywordsRequest,
  MyUploadFilterRequest,
  MyUploadItemResponse,
  PaginatedResponse,
  ResourceDetailResponse,
  ResourceKeywordItem,
  UpdateAuthorsRequest,
  UpdateResourceRequest,
  UploadResourceRequest,
} from '@/features/resources/types/resource.types';
import type {
  LookupItem,
  SourceCodePaginatedResult,
  SourceCodeQuery,
  UploadResourceSuccessResponse,
  UploadSourceCodeFormValues,
} from '@/features/digital-resources/source-code/types/source-code.types';
import type {
  LibraryResourceQuery,
  RecommendedResourceItem,
} from '@/features/digital-resources/all-resources/types/all-resources.types';

export function buildUploadResourceFormData(values: UploadResourceRequest | UploadSourceCodeFormValues): FormData {
  const formData = new FormData();
  formData.append('File', values.file);
  formData.append('FileName', values.fileName.trim());
  formData.append('FileTypeId', String(values.fileTypeId));
  formData.append('SubMajorCode', values.subMajorCode.trim());

  if (values.fileDescription?.trim()) {
    formData.append('FileDescription', values.fileDescription.trim());
  }
  if (values.courseCode?.trim()) {
    formData.append('CourseCode', values.courseCode.trim());
  }
  if (values.yearCompleted !== undefined && values.yearCompleted !== null) {
    formData.append('YearCompleted', String(values.yearCompleted));
  }
  if (values.githubLink?.trim()) {
    formData.append('GithubLink', values.githubLink.trim());
  }
  if (values.bannerImage) {
    formData.append('BannerImage', values.bannerImage);
  }

  // Luồng tài liệu dùng tên tác giả; giữ hợp đồng hiện tại của form mã nguồn.
  const authorField = 'authorNames' in values ? 'AuthorNames' : 'AuthorIds';
  const authors = 'authorNames' in values ? values.authorNames : values.authorIds;
  authors.forEach((author) => {
    if (author.trim()) {
      formData.append(authorField, author.trim());
    }
  });

  return formData;
}

export function triggerFileDownload(blob: Blob, fileName: string): void {
  if (typeof window === 'undefined' || !window.URL) return;
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.URL.revokeObjectURL(url);
}

export const resourceService = {
  // GET /api/ResourcesSearch
  async searchResources<T = SourceCodePaginatedResult>(query: SourceCodeQuery | LibraryResourceQuery): Promise<T> {
    const params: Record<string, string | number> = {
      PageNumber: query.pageNumber ?? 1,
      PageSize: query.pageSize ?? 12,
    };

    if (query.search?.trim()) {
      params.Search = query.search.trim();
    }
    if (query.fileTypeId !== undefined && query.fileTypeId > 0) {
      params.FileTypeId = query.fileTypeId;
    }
    if (query.subMajorId?.trim()) {
      params.SubMajorId = query.subMajorId.trim();
    }
    if (query.courseId?.trim()) {
      params.CourseId = query.courseId.trim();
    }
    if (query.statusId !== undefined && query.statusId > 0) {
      params.StatusId = query.statusId;
    }

    const response = await axiosClient.get<T>('/api/ResourcesSearch', {
      params,
    });

    return response.data;
  },

  // GET /api/Recommendation
  async getRecommendations(limit = 10): Promise<RecommendedResourceItem[]> {
    const response = await axiosClient.get<RecommendedResourceItem[]>('/api/Recommendation', {
      params: { limit },
    });

    return response.data;
  },

  // GET /api/Resources/{fileId}
  async getResourceDetail<T = ResourceDetailResponse>(fileId: string): Promise<T> {
    const response = await axiosClient.get<T>(`/api/Resources/${encodeURIComponent(fileId)}`);

    return response.data;
  },

  // POST /api/History/views
  async recordHistoryView(fileId: string): Promise<void> {
    await axiosClient.post('/api/History/views', {
      fileId,
    });
  },

  // GET /api/Resources/{fileId}/download
  async downloadResourceFile(fileId: string, fileName?: string): Promise<Blob> {
    const response = await axiosClient.get<Blob>(`/api/Resources/${encodeURIComponent(fileId)}/download`, {
      responseType: 'blob',
    });

    if (fileName) {
      triggerFileDownload(response.data, fileName);
    }

    return response.data;
  },

  // GET /api/Lookup/file-types
  async getFileTypes(): Promise<LookupItem[]> {
    const response = await axiosClient.get<LookupItem[]>('/api/Lookup/file-types');
    return response.data;
  },

  // GET /api/Lookup/submajors
  async getSubMajors(majorId?: string): Promise<LookupItem[]> {
    const response = await axiosClient.get<LookupItem[]>('/api/Lookup/submajors', {
      params: majorId ? { majorId } : undefined,
    });
    return response.data;
  },

  // GET /api/Lookup/courses
  async getCourses(submajorCode?: string): Promise<LookupItem[]> {
    const response = await axiosClient.get<LookupItem[]>('/api/Lookup/courses', {
      params: submajorCode ? { submajorCode } : undefined,
    });
    return response.data;
  },

  // GET /api/Lookup/file-statuses
  async getFileStatuses(): Promise<LookupItem[]> {
    const response = await axiosClient.get<LookupItem[]>('/api/Lookup/file-statuses');
    return response.data;
  },

  // POST /api/Resources
  async uploadResource(
    payload: FormData | UploadResourceRequest | UploadSourceCodeFormValues,
  ): Promise<UploadResourceSuccessResponse> {
    const formData = payload instanceof FormData ? payload : buildUploadResourceFormData(payload);

    const response = await axiosClient.post<UploadResourceSuccessResponse>('/api/Resources', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  // GET /api/Resources/my-uploads
  async getMyUploads(filter: MyUploadFilterRequest = {}): Promise<PaginatedResponse<MyUploadItemResponse>> {
    const params: Record<string, string | number> = {
      PageNumber: filter.pageNumber ?? 1,
      PageSize: filter.pageSize ?? 10,
    };

    if (filter.search?.trim()) {
      params.Search = filter.search.trim();
    }
    if (filter.fileStatusId !== undefined && filter.fileStatusId > 0) {
      params.FileStatusId = filter.fileStatusId;
    }
    if (filter.fileTypeId !== undefined && filter.fileTypeId > 0) {
      params.FileTypeId = filter.fileTypeId;
    }
    if (filter.sortBy?.trim()) {
      params.SortBy = filter.sortBy.trim();
    }
    if (filter.sortDirection) {
      params.SortDirection = filter.sortDirection;
    }

    const response = await axiosClient.get<PaginatedResponse<MyUploadItemResponse>>('/api/Resources/my-uploads', {
      params,
    });

    return response.data;
  },

  // DELETE /api/Resources/{fileId}
  async deleteResource(fileId: string): Promise<{ message: string }> {
    const response = await axiosClient.delete<{ message: string }>(`/api/Resources/${encodeURIComponent(fileId)}`);
    return response.data;
  },

  // PUT /api/ResourcesUpdate/{fileId}
  async updateResource(fileId: string, payload: UpdateResourceRequest): Promise<{ message?: string }> {
    const response = await axiosClient.put<{ message?: string }>(
      `/api/ResourcesUpdate/${encodeURIComponent(fileId)}`,
      payload,
    );
    return response.data;
  },

  // PUT /api/Resources/{fileId}/authors
  async updateAuthors(fileId: string, authorNames: string[]): Promise<{ message?: string }> {
    const response = await axiosClient.put<{ message?: string }>(
      `/api/Resources/${encodeURIComponent(fileId)}/authors`,
      { authorNames } satisfies UpdateAuthorsRequest,
    );
    return response.data;
  },

  // POST /api/Resources/{fileId}/keywords
  async addKeywords(fileId: string, keywords: string[]): Promise<{ message?: string }> {
    const response = await axiosClient.post<{ message?: string }>(
      `/api/Resources/${encodeURIComponent(fileId)}/keywords`,
      { keywords } satisfies AddKeywordsRequest,
    );
    return response.data;
  },

  // GET /api/Resources/{fileId}/keywords
  async getResourceKeywords(fileId: string): Promise<ResourceKeywordItem[]> {
    const response = await axiosClient.get<ResourceKeywordItem[]>(
      `/api/Resources/${encodeURIComponent(fileId)}/keywords`,
    );
    return response.data;
  },

  // DELETE /api/Resources/{fileId}/keywords/{keywordId}
  async deleteKeyword(fileId: string, keywordId: string): Promise<{ message?: string }> {
    const response = await axiosClient.delete<{ message?: string }>(
      `/api/Resources/${encodeURIComponent(fileId)}/keywords/${encodeURIComponent(keywordId)}`,
    );
    return response.data;
  },
};

export default resourceService;
