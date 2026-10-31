import { jobFixture } from '@/features/processing/components/__tests__/fixtures';
import { act, renderHook } from '@testing-library/react';
import axios, { type InternalAxiosRequestConfig } from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  MAX_BANNER_FILE_SIZE,
  MAX_SOURCE_CODE_FILE_SIZE,
  useUploadSourceCode,
  validateBannerFile,
  validateSourceCodeFile,
} from '../useUploadSourceCode';
import { resourceService } from '@/services/resourceService';
import { useAuthStore } from '@/store/authStore';

vi.mock('@/services/resourceService', () => ({
  resourceService: {
    uploadResource: vi.fn(),
  },
}));

describe('useUploadSourceCode hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      user: {
        uid: 'USR_TEST_001',
        userCode: 'SV001',
        fullName: 'Nguyễn Hùng',
        email: 'hung@test.com',
        roleId: 1,
        role: 'Student',
      },
    });
  });

  describe('file validator functions', () => {
    it('validateSourceCodeFile báo lỗi khi không có file', () => {
      expect(validateSourceCodeFile(null)).toBe('Vui lòng chọn tệp mã nguồn hoặc tài liệu dự án.');
    });

    it('validateSourceCodeFile báo lỗi với định dạng không được hỗ trợ', () => {
      const file = new File(['data'], 'script.exe', { type: 'application/octet-stream' });
      expect(validateSourceCodeFile(file)).toBe(
        'Chỉ hỗ trợ tệp nén (.zip, .rar, .7z, .tar, .gz) hoặc tài liệu (.pdf, .docx).',
      );
    });

    it('validateSourceCodeFile báo lỗi khi kích thước vượt quá 50MB', () => {
      const largeFile = new File(['a'], 'source.zip', { type: 'application/zip' });
      Object.defineProperty(largeFile, 'size', { value: MAX_SOURCE_CODE_FILE_SIZE + 1 });
      expect(validateSourceCodeFile(largeFile)).toBe('Dung lượng tệp không được vượt quá 50 MB.');
    });

    it('validateSourceCodeFile chấp nhận file zip/docx hợp lệ', () => {
      const validZip = new File(['a'], 'project.zip', { type: 'application/zip' });
      expect(validateSourceCodeFile(validZip)).toBeUndefined();

      const validDocx = new File(['b'], 'report.docx', {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });
      expect(validateSourceCodeFile(validDocx)).toBeUndefined();
    });

    it('validateBannerFile kiểm tra định dạng và dung lượng ảnh bìa', () => {
      expect(validateBannerFile(null)).toBeUndefined();

      const invalidMime = new File(['img'], 'banner.pdf', { type: 'application/pdf' });
      expect(validateBannerFile(invalidMime)).toBe('Ảnh bìa phải có định dạng JPEG, PNG hoặc WEBP.');

      const largeImg = new File(['img'], 'banner.png', { type: 'image/png' });
      Object.defineProperty(largeImg, 'size', { value: MAX_BANNER_FILE_SIZE + 1 });
      expect(validateBannerFile(largeImg)).toBe('Dung lượng ảnh bìa không được vượt quá 5 MB.');

      const validImg = new File(['img'], 'banner.png', { type: 'image/png' });
      expect(validateBannerFile(validImg)).toBeUndefined();
    });
  });

  describe('hook lifecycle and state management', () => {
    it('khởi tạo với danh sách tác giả rỗng, chưa chọn file', () => {
      const { result } = renderHook(() => useUploadSourceCode({ fileTypeId: 5 }));

      expect(result.current.authorIds).toEqual([]);
      expect(result.current.file).toBeNull();
      expect(result.current.fileName).toBe('');
      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.apiError).toBeNull();
      expect(result.current.isSuccess).toBe(false);
    });

    it('tự động điền fileName từ tên file nếu fileName đang rỗng', () => {
      const { result } = renderHook(() => useUploadSourceCode({ fileTypeId: 5 }));

      const mockFile = new File(['content'], 'quan-ly-nckh.zip', { type: 'application/zip' });

      act(() => {
        result.current.setFile(mockFile);
      });

      expect(result.current.file).toBe(mockFile);
      expect(result.current.fileName).toBe('quan-ly-nckh');
    });

    it('cập nhật lại fileName khi hủy file cũ và chọn file mới', () => {
      const { result } = renderHook(() => useUploadSourceCode({ fileTypeId: 5 }));

      const oldFile = new File(['content'], 'project-cu.zip', { type: 'application/zip' });
      act(() => {
        result.current.setFile(oldFile);
      });
      expect(result.current.fileName).toBe('project-cu');

      // Hủy file
      act(() => {
        result.current.setFile(null);
      });
      expect(result.current.file).toBeNull();
      expect(result.current.fileName).toBe('');

      // Chọn file mới
      const newFile = new File(['content'], 'project-moi.docx', {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });
      act(() => {
        result.current.setFile(newFile);
      });
      expect(result.current.file).toBe(newFile);
      expect(result.current.fileName).toBe('project-moi');
    });

    it('ghi đè fileName theo file mới ngay cả khi người dùng đã sửa tên trước đó', () => {
      const { result } = renderHook(() => useUploadSourceCode({ fileTypeId: 5 }));

      const oldFile = new File(['content'], 'project-cu.zip', { type: 'application/zip' });
      act(() => {
        result.current.setFile(oldFile);
      });
      expect(result.current.fileName).toBe('project-cu');

      // Tự sửa tên
      act(() => {
        result.current.setFileName('Tên dự án tự đặt');
      });
      expect(result.current.fileName).toBe('Tên dự án tự đặt');

      // Hủy file -> fileName xóa rỗng
      act(() => {
        result.current.setFile(null);
      });
      expect(result.current.fileName).toBe('');

      // Chọn file mới -> Luôn ghi đè theo file mới
      const newFile = new File(['content'], 'project-moi.zip', { type: 'application/zip' });
      act(() => {
        result.current.setFile(newFile);
      });
      expect(result.current.fileName).toBe('project-moi');
    });

    it('thêm và xóa tác giả chính xác', () => {
      const { result } = renderHook(() => useUploadSourceCode({ fileTypeId: 5 }));

      act(() => {
        result.current.addAuthorId('USR_TEST_001');
      });
      expect(result.current.authorIds).toEqual(['USR_TEST_001']);

      act(() => {
        result.current.addAuthorId('USR_TEST_002');
      });
      expect(result.current.authorIds).toEqual(['USR_TEST_001', 'USR_TEST_002']);

      // Không thêm trùng lặp
      act(() => {
        result.current.addAuthorId('USR_TEST_002');
      });
      expect(result.current.authorIds).toEqual(['USR_TEST_001', 'USR_TEST_002']);

      act(() => {
        result.current.removeAuthorId('USR_TEST_001');
      });
      expect(result.current.authorIds).toEqual(['USR_TEST_002']);
    });

    it('validateForm phát hiện đầy đủ các trường không hợp lệ', () => {
      const { result } = renderHook(() => useUploadSourceCode({ fileTypeId: 5 }));

      act(() => {
        result.current.setYearCompleted('1990');
        result.current.setGithubLink('https://gitlab.com/invalid');
      });

      let isValid = false;
      act(() => {
        isValid = result.current.validateForm();
      });

      expect(isValid).toBe(false);
      expect(result.current.errors.file).toBe('Vui lòng chọn tệp mã nguồn hoặc tài liệu dự án.');
      expect(result.current.errors.fileName).toBe('Vui lòng nhập tên đề tài / dự án mã nguồn.');
      expect(result.current.errors.subMajorCode).toBe('Vui lòng chọn chuyên ngành đào tạo.');
      expect(result.current.errors.yearCompleted).toBeDefined();
      expect(result.current.errors.githubLink).toBeDefined();
      expect(result.current.errors.authorIds).toBe('Phải có ít nhất một tác giả thực hiện đề tài.');
    });

    it('gửi form thành công khi dữ liệu hợp lệ và kích hoạt onSuccess', async () => {
      const handleSuccess = vi.fn();
      vi.mocked(resourceService.uploadResource).mockResolvedValueOnce({
        message: 'Tải tài liệu thành công.',
      });

      const { result } = renderHook(() => useUploadSourceCode({ fileTypeId: 5, onSuccess: handleSuccess }));

      const mockFile = new File(['test'], 'source-code.zip', { type: 'application/zip' });

      act(() => {
        result.current.setFile(mockFile);
        result.current.setFileName('Hệ thống Quản lý Bệnh viện');
        result.current.setSubMajorCode('CNTT_KTPM');
        result.current.setCourseCode('IT3040');
        result.current.addAuthorId('USR_TEST_001');
        result.current.setGithubLink('https://github.com/myteam/hospital-app');
      });

      let success = false;
      await act(async () => {
        success = await result.current.handleSubmit();
      });

      expect(success).toBe(true);
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.apiError).toBeNull();
      expect(handleSuccess).toHaveBeenCalledTimes(1);
      expect(resourceService.uploadResource).toHaveBeenCalledWith(
        expect.objectContaining({
          fileName: 'Hệ thống Quản lý Bệnh viện',
          fileTypeId: 5,
          subMajorCode: 'CNTT_KTPM',
          courseCode: 'IT3040',
          authorIds: ['USR_TEST_001'],
          githubLink: 'https://github.com/myteam/hospital-app',
        }),
      );
    });

    it('xử lý lỗi khi backend trả về lỗi', async () => {
      const mockAxiosError = new axios.AxiosError('Bad Request');
      mockAxiosError.response = {
        data: { message: 'Dữ liệu không hợp lệ hoặc thiếu thông tin bắt buộc' },
        status: 400,
        statusText: 'Bad Request',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      };

      vi.mocked(resourceService.uploadResource).mockRejectedValueOnce(mockAxiosError);

      const { result } = renderHook(() => useUploadSourceCode({ fileTypeId: 5 }));

      const mockFile = new File(['test'], 'source.zip', { type: 'application/zip' });

      act(() => {
        result.current.setFile(mockFile);
        result.current.setFileName('Dự án lỗi');
        result.current.setSubMajorCode('CNTT_KTPM');
        result.current.addAuthorId('USR_TEST_001');
      });

      let success = true;
      await act(async () => {
        success = await result.current.handleSubmit();
      });

      expect(success).toBe(false);
      expect(result.current.isSuccess).toBe(false);
      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.apiError).toBe('Dữ liệu không hợp lệ hoặc thiếu thông tin bắt buộc');
    });

    it('resetForm đưa toàn bộ state về giá trị mặc định ban đầu', () => {
      const { result } = renderHook(() => useUploadSourceCode({ fileTypeId: 5 }));

      act(() => {
        result.current.setFileName('Tên cũ');
        result.current.setSubMajorCode('SE');
        result.current.addAuthorId('USR_TEST_001');
        result.current.resetForm();
      });

      expect(result.current.fileName).toBe('');
      expect(result.current.subMajorCode).toBe('');
      expect(result.current.authorIds).toEqual([]);
      expect(result.current.errors).toEqual({});
    });
  });
  it('retains an accepted document job and deduplicates simultaneous submissions', async () => {
    let complete!: (value: Awaited<ReturnType<typeof resourceService.uploadResource>>) => void;
    vi.mocked(resourceService.uploadResource).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          complete = resolve;
        }),
    );
    const onAccepted = vi.fn();
    const onSuccess = vi.fn();
    const { result } = renderHook(() => useUploadSourceCode({ fileTypeId: 5, onAccepted, onSuccess }));
    act(() => {
      result.current.setFile(new File(['pdf'], 'report.pdf', { type: 'application/pdf' }));
      result.current.setFileName('Report');
      result.current.setSubMajorCode('SE');
      result.current.setAuthorIds(['Author']);
    });
    await act(async () => {
      const pending = result.current.handleSubmit();
      expect(await result.current.handleSubmit()).toBe(false);
      complete({
        message: 'Accepted',
        data: {
          id: 'file',
          fileName: 'Report',
          fileTypeName: 'Document',
          fileSizeBytes: 3,
          uploadedAt: '2026-10-30T00:00:00Z',
          processingJob: jobFixture,
        },
      });
      expect(await pending).toBe(true);
    });
    expect(resourceService.uploadResource).toHaveBeenCalledTimes(1);
    expect(onAccepted).toHaveBeenCalledWith(jobFixture);
    expect(onSuccess).not.toHaveBeenCalled();
    expect(result.current.isSuccess).toBe(false);
  });
});
