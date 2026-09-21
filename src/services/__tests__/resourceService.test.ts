import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import axiosClient from '@/services/axiosClient';
import { buildUploadResourceFormData, resourceService, triggerFileDownload } from '../resourceService';
import type {
  LookupItem,
  SourceCodeDetail,
  SourceCodePaginatedResult,
  UploadResourceSuccessResponse,
  UploadSourceCodeFormValues,
} from '@/features/digital-resources/source-code/types/source-code.types';

vi.mock('@/services/axiosClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('resourceService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('searchResources', () => {
    it('gọi GET /api/ResourcesSearch với tham số mặc định', async () => {
      const mockResult: SourceCodePaginatedResult = {
        items: [],
        totalCount: 0,
        page: 1,
        pageSize: 12,
      };

      vi.mocked(axiosClient.get).mockResolvedValueOnce({ data: mockResult });

      const result = await resourceService.searchResources({});

      expect(axiosClient.get).toHaveBeenCalledWith('/api/ResourcesSearch', {
        params: {
          PageNumber: 1,
          PageSize: 12,
        },
      });
      expect(result).toEqual(mockResult);
    });

    it('gửi đầy đủ các tham số bộ lọc khi được truyền', async () => {
      const mockResult: SourceCodePaginatedResult = {
        items: [
          {
            fileId: 'FIL_001',
            fileName: 'Hệ thống Quản lý Khách sạn',
            fileDescription: 'Mã nguồn NodeJS và React',
            fileUrl: 'https://example.com/file.zip',
            fileTypeId: 5,
            fileTypeName: 'Mã nguồn',
            subMajorCode: 'CNTT_KTPM',
            courseCode: 'IT3040',
            yearCompleted: 2026,
            githubLink: 'https://github.com/example/hotel-management',
            bannerUrl: 'https://example.com/banner.png',
            fileStatusId: 2,
            fileStatusName: 'Approved',
            uploadUserId: 'USR_001',
            createdAt: '2026-09-20T10:00:00Z',
          },
        ],
        totalCount: 1,
        page: 2,
        pageSize: 10,
      };

      vi.mocked(axiosClient.get).mockResolvedValueOnce({ data: mockResult });

      const result = await resourceService.searchResources({
        search: '  Khách sạn  ',
        fileTypeId: 5,
        subMajorId: 'CNTT_KTPM',
        courseId: 'IT3040',
        statusId: 2,
        pageNumber: 2,
        pageSize: 10,
      });

      expect(axiosClient.get).toHaveBeenCalledWith('/api/ResourcesSearch', {
        params: {
          Search: 'Khách sạn',
          FileTypeId: 5,
          SubMajorId: 'CNTT_KTPM',
          CourseId: 'IT3040',
          StatusId: 2,
          PageNumber: 2,
          PageSize: 10,
        },
      });
      expect(result.items).toHaveLength(1);
      expect(result.items[0].fileName).toBe('Hệ thống Quản lý Khách sạn');
    });
  });

  describe('getResourceDetail', () => {
    it('gọi GET /api/Resources/{fileId} với fileId mã hóa an toàn', async () => {
      const mockDetail: SourceCodeDetail = {
        fileId: 'FIL/SPECIAL#01',
        fileName: 'Project AI',
        fileDescription: 'Mô tả chi tiết',
        fileUrl: 'https://example.com/ai.zip',
        fileTypeId: 5,
        fileTypeName: 'Mã nguồn',
        subMajorCode: 'CNTT_AI',
        subMajorName: 'Trí tuệ nhân tạo',
        majorName: 'Công nghệ thông tin',
        departmentName: 'Khoa CNTT',
        courseCode: 'IT4010',
        courseName: 'Deep Learning',
        yearCompleted: 2026,
        githubLink: 'https://github.com/example/ai-repo',
        bannerUrl: null,
        fileStatusId: 2,
        fileStatusName: 'Approved',
        uploadUserId: 'USR_002',
        uploadUserName: 'Nguyễn Văn A',
        uploadUserEmail: 'a@example.com',
        createdAt: '2026-09-20T10:00:00Z',
        updatedAt: null,
        authors: [{ id: 'AUTH_01', fullName: 'Nguyễn Văn A' }],
        keywords: [{ id: 1, keyword: 'Machine Learning' }],
        ratingSummary: { averageRating: 4.8, totalRatings: 15 },
      };

      vi.mocked(axiosClient.get).mockResolvedValueOnce({ data: mockDetail });

      const result = await resourceService.getResourceDetail('FIL/SPECIAL#01');

      expect(axiosClient.get).toHaveBeenCalledWith('/api/Resources/FIL%2FSPECIAL%2301');
      expect(result.fileName).toBe('Project AI');
      expect(result.authors).toHaveLength(1);
    });
  });

  describe('recordHistoryView', () => {
    it('gọi POST /api/History/views với fileId trong request body', async () => {
      vi.mocked(axiosClient.post).mockResolvedValueOnce({ data: { message: 'Success' } });

      await resourceService.recordHistoryView('FIL_999');

      expect(axiosClient.post).toHaveBeenCalledWith('/api/History/views', {
        fileId: 'FIL_999',
      });
    });
  });

  describe('downloadResourceFile', () => {
    it('gọi GET /api/Resources/{fileId}/download với responseType là blob', async () => {
      const mockBlob = new Blob(['sample-code'], { type: 'application/zip' });
      vi.mocked(axiosClient.get).mockResolvedValueOnce({ data: mockBlob });

      const result = await resourceService.downloadResourceFile('FIL_123');

      expect(axiosClient.get).toHaveBeenCalledWith('/api/Resources/FIL_123/download', {
        responseType: 'blob',
      });
      expect(result).toBe(mockBlob);
    });

    it('kích hoạt tải tệp khi truyền fileName', async () => {
      const mockBlob = new Blob(['sample-code'], { type: 'application/zip' });
      vi.mocked(axiosClient.get).mockResolvedValueOnce({ data: mockBlob });

      const createObjectURLSpy = vi.fn().mockReturnValue('blob:http://localhost/mock-uuid');
      const revokeObjectURLSpy = vi.fn();
      window.URL.createObjectURL = createObjectURLSpy;
      window.URL.revokeObjectURL = revokeObjectURLSpy;

      const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
      const appendChildSpy = vi.spyOn(document.body, 'appendChild');
      const removeChildSpy = vi.spyOn(document.body, 'removeChild');

      await resourceService.downloadResourceFile('FIL_123', 'project-source.zip');

      expect(createObjectURLSpy).toHaveBeenCalledWith(mockBlob);
      expect(clickSpy).toHaveBeenCalled();
      expect(appendChildSpy).toHaveBeenCalled();
      expect(removeChildSpy).toHaveBeenCalled();
      expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:http://localhost/mock-uuid');
      clickSpy.mockRestore();
    });
  });

  describe('Lookup methods', () => {
    it('getFileTypes gọi đúng endpoint /api/Lookup/file-types', async () => {
      const mockFileTypes: LookupItem[] = [
        { id: '1', name: 'Báo cáo NCKH' },
        { id: '5', name: 'Mã nguồn' },
      ];
      vi.mocked(axiosClient.get).mockResolvedValueOnce({ data: mockFileTypes });

      const result = await resourceService.getFileTypes();

      expect(axiosClient.get).toHaveBeenCalledWith('/api/Lookup/file-types');
      expect(result).toEqual(mockFileTypes);
    });

    it('getSubMajors gọi đúng endpoint với hoặc không có majorId', async () => {
      const mockSubMajors: LookupItem[] = [{ id: 'CNTT_KTPM', name: 'Kỹ thuật phần mềm' }];
      vi.mocked(axiosClient.get).mockResolvedValueOnce({ data: mockSubMajors });

      const result = await resourceService.getSubMajors('7480201');

      expect(axiosClient.get).toHaveBeenCalledWith('/api/Lookup/submajors', {
        params: { majorId: '7480201' },
      });
      expect(result).toEqual(mockSubMajors);
    });

    it('getCourses gọi đúng endpoint với hoặc không có submajorCode', async () => {
      const mockCourses: LookupItem[] = [{ id: 'IT3040', name: 'Thực tập chuyên ngành' }];
      vi.mocked(axiosClient.get).mockResolvedValueOnce({ data: mockCourses });

      const result = await resourceService.getCourses('CNTT_KTPM');

      expect(axiosClient.get).toHaveBeenCalledWith('/api/Lookup/courses', {
        params: { submajorCode: 'CNTT_KTPM' },
      });
      expect(result).toEqual(mockCourses);
    });

    it('getFileStatuses gọi đúng endpoint /api/Lookup/file-statuses', async () => {
      const mockStatuses: LookupItem[] = [
        { id: '1', name: 'Chờ duyệt' },
        { id: '2', name: 'Đã duyệt' },
        { id: '3', name: 'Bị từ chối' },
      ];
      vi.mocked(axiosClient.get).mockResolvedValueOnce({ data: mockStatuses });

      const result = await resourceService.getFileStatuses();

      expect(axiosClient.get).toHaveBeenCalledWith('/api/Lookup/file-statuses');
      expect(result).toEqual(mockStatuses);
    });
  });

  describe('triggerFileDownload utility', () => {
    it('hoạt động an toàn trong môi trường browser', () => {
      const mockBlob = new Blob(['code']);
      const createObjectURLSpy = vi.fn().mockReturnValue('blob:mock');
      const revokeObjectURLSpy = vi.fn();
      window.URL.createObjectURL = createObjectURLSpy;
      window.URL.revokeObjectURL = revokeObjectURLSpy;

      triggerFileDownload(mockBlob, 'demo.zip');

      expect(createObjectURLSpy).toHaveBeenCalledWith(mockBlob);
      expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:mock');
    });
  });

  describe('buildUploadResourceFormData utility', () => {
    it('gửi tên tác giả và các trường của UploadResourceRequest theo đúng hợp đồng backend', () => {
      const file = new File(['document'], 'report.pdf', { type: 'application/pdf' });
      const bannerImage = new File(['image'], 'banner.png', { type: 'image/png' });
      const values = {
        file,
        fileName: '  Báo cáo nghiên cứu  ',
        fileDescription: '  Mô tả báo cáo  ',
        fileTypeId: 1,
        subMajorCode: '  SE  ',
        courseCode: '  PRN222  ',
        yearCompleted: 2025,
        authorNames: ['  Nguyễn Văn An  ', 'Trần Minh Bình', '   '],
        githubLink: '  https://github.com/example/report  ',
        bannerImage,
      };

      const formData = buildUploadResourceFormData(values);

      expect(Array.from(formData.keys()).sort()).toEqual([
        'AuthorNames',
        'AuthorNames',
        'BannerImage',
        'CourseCode',
        'File',
        'FileDescription',
        'FileName',
        'FileTypeId',
        'GithubLink',
        'SubMajorCode',
        'YearCompleted',
      ]);
      expect(formData.get('File')).toBe(file);
      expect(formData.get('FileName')).toBe('Báo cáo nghiên cứu');
      expect(formData.get('FileDescription')).toBe('Mô tả báo cáo');
      expect(formData.get('FileTypeId')).toBe('1');
      expect(formData.get('SubMajorCode')).toBe('SE');
      expect(formData.get('CourseCode')).toBe('PRN222');
      expect(formData.get('YearCompleted')).toBe('2025');
      expect(formData.getAll('AuthorNames')).toEqual(['Nguyễn Văn An', 'Trần Minh Bình']);
      expect(formData.get('GithubLink')).toBe('https://github.com/example/report');
      expect(formData.get('BannerImage')).toBe(bannerImage);
    });

    it('không gửi null hoặc chuỗi trắng cho các trường upload tùy chọn', () => {
      const formData = buildUploadResourceFormData({
        file: new File(['document'], 'report.pdf', { type: 'application/pdf' }),
        fileName: 'Báo cáo',
        fileDescription: '  ',
        fileTypeId: 1,
        subMajorCode: 'SE',
        courseCode: null,
        yearCompleted: null,
        authorNames: ['Nguyễn Văn An'],
        githubLink: null,
        bannerImage: null,
      });

      expect(Array.from(formData.keys()).sort()).toEqual([
        'AuthorNames',
        'File',
        'FileName',
        'FileTypeId',
        'SubMajorCode',
      ]);
    });

    it('đóng gói đúng các trường cơ bản và mảng tác giả vào FormData', () => {
      const mockFile = new File(['content'], 'project.zip', { type: 'application/zip' });
      const mockBanner = new File(['image'], 'banner.png', { type: 'image/png' });

      const values: UploadSourceCodeFormValues = {
        file: mockFile,
        fileName: '  Hệ thống AI IoT  ',
        fileDescription: 'Mô tả chi tiết dự án',
        fileTypeId: 5,
        subMajorCode: 'CNTT_KTPM',
        courseCode: 'IT3040',
        yearCompleted: 2026,
        authorIds: ['USR_001', 'USR_002'],
        githubLink: 'https://github.com/myuser/ai-iot',
        bannerImage: mockBanner,
      };

      const formData = buildUploadResourceFormData(values);

      expect(formData.get('File')).toBe(mockFile);
      expect(formData.get('FileName')).toBe('Hệ thống AI IoT');
      expect(formData.get('FileTypeId')).toBe('5');
      expect(formData.get('SubMajorCode')).toBe('CNTT_KTPM');
      expect(formData.get('FileDescription')).toBe('Mô tả chi tiết dự án');
      expect(formData.get('CourseCode')).toBe('IT3040');
      expect(formData.get('YearCompleted')).toBe('2026');
      expect(formData.get('GithubLink')).toBe('https://github.com/myuser/ai-iot');
      expect(formData.get('BannerImage')).toBe(mockBanner);
      expect(formData.getAll('AuthorIds')).toEqual(['USR_001', 'USR_002']);
    });

    it('bỏ qua các trường tùy chọn không có dữ liệu', () => {
      const mockFile = new File(['code'], 'source.tar.gz', { type: 'application/gzip' });

      const values: UploadSourceCodeFormValues = {
        file: mockFile,
        fileName: 'Dự án Mini',
        fileTypeId: 5,
        subMajorCode: 'CNTT_KHMT',
        authorIds: ['USR_001'],
      };

      const formData = buildUploadResourceFormData(values);

      expect(formData.get('File')).toBe(mockFile);
      expect(formData.get('FileName')).toBe('Dự án Mini');
      expect(formData.get('FileTypeId')).toBe('5');
      expect(formData.get('SubMajorCode')).toBe('CNTT_KHMT');
      expect(formData.get('FileDescription')).toBeNull();
      expect(formData.get('CourseCode')).toBeNull();
      expect(formData.get('YearCompleted')).toBeNull();
      expect(formData.get('GithubLink')).toBeNull();
      expect(formData.get('BannerImage')).toBeNull();
      expect(formData.getAll('AuthorIds')).toEqual(['USR_001']);
    });
  });

  describe('uploadResource', () => {
    it('gửi FormData với header multipart/form-data đến POST /api/Resources', async () => {
      const mockResponse: UploadResourceSuccessResponse = {
        message: 'Tải tài liệu thành công.',
        data: {
          id: 'FIL_NEW_01',
          fileName: 'Hệ thống Quản lý',
          fileTypeName: 'Mã nguồn',
          fileSizeBytes: 1048576,
          uploadedAt: '2026-09-20T10:00:00Z',
        },
      };

      vi.mocked(axiosClient.post).mockResolvedValueOnce({ data: mockResponse });

      const formData = new FormData();
      formData.append('FileName', 'Test');

      const result = await resourceService.uploadResource(formData);

      expect(axiosClient.post).toHaveBeenCalledWith('/api/Resources', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      expect(result).toEqual(mockResponse);
    });

    it('tự động chuyển đổi UploadSourceCodeFormValues sang FormData khi gọi uploadResource', async () => {
      const mockResponse: UploadResourceSuccessResponse = {
        message: 'Tải tài liệu thành công.',
      };

      vi.mocked(axiosClient.post).mockResolvedValueOnce({ data: mockResponse });

      const mockFile = new File(['test'], 'app.zip', { type: 'application/zip' });
      const values: UploadSourceCodeFormValues = {
        file: mockFile,
        fileName: 'Ứng dụng Di động',
        fileTypeId: 5,
        subMajorCode: 'CNTT_KTPM',
        authorIds: ['USR_001'],
      };

      const result = await resourceService.uploadResource(values);

      expect(axiosClient.post).toHaveBeenCalledWith('/api/Resources', expect.any(FormData), {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      expect(result).toEqual(mockResponse);
    });
  });
});
