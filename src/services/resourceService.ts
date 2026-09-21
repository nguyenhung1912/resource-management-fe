import axiosClient from '@/services/axiosClient';
import type { UploadResourceRequest } from '@/features/resources/types/resource.types';
import type {
  LookupItem,
  SourceCodeDetail,
  SourceCodePaginatedResult,
  SourceCodeQuery,
  UploadResourceSuccessResponse,
  UploadSourceCodeFormValues,
} from '@/features/digital-resources/source-code/types/source-code.types';

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
  async searchResources(query: SourceCodeQuery): Promise<SourceCodePaginatedResult> {
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

    const response = await axiosClient.get<SourceCodePaginatedResult>('/api/ResourcesSearch', {
      params,
    });

    return response.data;
  },

  // GET /api/Resources/{fileId}
  async getResourceDetail(fileId: string): Promise<SourceCodeDetail> {
    const response = await axiosClient.get<SourceCodeDetail>(`/api/Resources/${encodeURIComponent(fileId)}`);

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
};

export default resourceService;
