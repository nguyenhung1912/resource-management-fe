import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import axios, { type InternalAxiosRequestConfig } from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UploadSourceCodeDialog } from '../UploadSourceCodeDialog';
import type { LookupItem } from '../../types/source-code.types';
import { resourceService } from '@/services/resourceService';

vi.mock('@/services/resourceService', () => ({
  resourceService: {
    uploadResource: vi.fn(),
  },
}));

const mockSubMajors: LookupItem[] = [
  { id: 'CNTT_KTPM', name: 'Kỹ thuật phần mềm' },
  { id: 'CNTT_AI', name: 'Trí tuệ nhân tạo' },
];

const mockCourses: LookupItem[] = [
  { id: 'IT3040', name: 'Thực tập chuyên ngành' },
  { id: 'IT4020', name: 'Thị giác máy tính' },
];

const mockFileTypes: LookupItem[] = [
  { id: '1', name: 'Mã nguồn' },
  { id: '2', name: 'Đồ án tốt nghiệp' },
];

describe('UploadSourceCodeDialog', () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('không render khi isOpen = false', () => {
    render(
      <UploadSourceCodeDialog isOpen={false} onClose={mockOnClose} subMajors={mockSubMajors} courses={mockCourses} />,
    );

    expect(screen.queryByText(/Đăng tải Mã nguồn & Dự án mẫu/i)).not.toBeInTheDocument();
  });

  it('render đầy đủ tiêu đề và các trường biểu mẫu khi isOpen = true', () => {
    render(
      <UploadSourceCodeDialog isOpen={true} onClose={mockOnClose} subMajors={mockSubMajors} courses={mockCourses} />,
    );

    // Tiêu đề & Badge
    expect(screen.getByText(/Đăng tải Mã nguồn & Dự án mẫu/i)).toBeInTheDocument();
    expect(screen.getByText('Mã nguồn')).toBeInTheDocument();

    // Dropzone & các ô nhập liệu
    expect(screen.getByText(/Tệp mã nguồn dự án/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tên đề tài \/ Dự án mã nguồn/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Kho lưu trữ GitHub/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Chuyên ngành/i)).toBeInTheDocument();

    // Nút hành động
    expect(screen.getByRole('button', { name: 'Hủy' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Đăng tải dự án/i })).toBeInTheDocument();
  });

  it('báo lỗi validation khi submit form mà chưa chọn file và nhập trường bắt buộc', async () => {
    render(
      <UploadSourceCodeDialog isOpen={true} onClose={mockOnClose} subMajors={mockSubMajors} courses={mockCourses} />,
    );

    const submitBtn = screen.getByRole('button', { name: /Đăng tải dự án/i });

    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(screen.getByText('Vui lòng chọn tệp mã nguồn hoặc tài liệu dự án.')).toBeInTheDocument();
    expect(screen.getByText('Vui lòng nhập tên đề tài / dự án mã nguồn.')).toBeInTheDocument();
    expect(screen.getByText('Vui lòng chọn chuyên ngành đào tạo.')).toBeInTheDocument();
    expect(resourceService.uploadResource).not.toHaveBeenCalled();
  });

  it('tự động điền tên dự án từ tệp tải lên khi tên dự án đang trống', () => {
    render(
      <UploadSourceCodeDialog isOpen={true} onClose={mockOnClose} subMajors={mockSubMajors} courses={mockCourses} />,
    );

    const fileInput = screen.getByLabelText('Tệp mã nguồn dự án');
    const mockFile = new File(['code'], 'he-thong-diem-danh-ai.zip', {
      type: 'application/zip',
    });

    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    const nameInput = screen.getByLabelText(/Tên đề tài \/ Dự án mã nguồn/i) as HTMLInputElement;
    expect(nameInput.value).toBe('he-thong-diem-danh-ai');
  });

  it('hỗ trợ thêm và xóa đồng tác giả', () => {
    render(
      <UploadSourceCodeDialog isOpen={true} onClose={mockOnClose} subMajors={mockSubMajors} courses={mockCourses} />,
    );

    const authorInput = screen.getByPlaceholderText('Nhập họ và tên tác giả và nhấn Enter...');
    const addBtn = screen.getByRole('button', { name: 'Thêm tác giả' });

    // Thêm đồng tác giả qua nút click
    fireEvent.change(authorInput, { target: { value: 'Nguyễn Văn B' } });
    fireEvent.click(addBtn);

    expect(screen.getByText('Nguyễn Văn B')).toBeInTheDocument();

    // Thêm đồng tác giả qua nhấn phím Enter
    fireEvent.change(authorInput, { target: { value: 'Trần Thị C' } });
    fireEvent.keyDown(authorInput, { key: 'Enter', code: 'Enter' });

    expect(screen.getByText('Trần Thị C')).toBeInTheDocument();

    // Xóa một đồng tác giả
    const deleteBtn = screen.getByRole('button', { name: 'Xóa tác giả Nguyễn Văn B' });
    fireEvent.click(deleteBtn);

    expect(screen.queryByText('Nguyễn Văn B')).not.toBeInTheDocument();
    expect(screen.getByText('Trần Thị C')).toBeInTheDocument();
  });

  it('báo lỗi khi nhập đường dẫn GitHub không đúng định dạng', async () => {
    render(
      <UploadSourceCodeDialog isOpen={true} onClose={mockOnClose} subMajors={mockSubMajors} courses={mockCourses} />,
    );

    const fileInput = screen.getByLabelText('Tệp mã nguồn dự án');
    const mockFile = new File(['data'], 'app.zip', { type: 'application/zip' });
    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    const githubInput = screen.getByPlaceholderText('https://github.com/username/project-repository');
    fireEvent.change(githubInput, { target: { value: 'https://gitlab.com/invalid/repo' } });

    const submitBtn = screen.getByRole('button', { name: /Đăng tải dự án/i });
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(screen.getByText(/Đường dẫn GitHub không hợp lệ/i)).toBeInTheDocument();
  });

  it('gửi form thành công, gọi onSuccess và đóng modal', async () => {
    vi.mocked(resourceService.uploadResource).mockResolvedValueOnce({
      message: 'Tải tài liệu thành công.',
      data: {
        id: 'FIL_SUCCESS_01',
        fileName: 'Hệ thống Quản lý Khách sạn Thông minh',
        fileTypeName: 'Mã nguồn',
        fileSizeBytes: 2048576,
        uploadedAt: '2026-09-20T10:00:00Z',
      },
    });

    render(
      <UploadSourceCodeDialog
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        fileTypes={mockFileTypes}
        subMajors={mockSubMajors}
        courses={mockCourses}
      />,
    );

    // 1. Chọn tệp mã nguồn
    const fileInput = screen.getByLabelText('Tệp mã nguồn dự án');
    const mockFile = new File(['binary-code'], 'hotel-system.zip', {
      type: 'application/zip',
    });
    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    // 2. Nhập tên dự án
    const nameInput = screen.getByLabelText(/Tên đề tài \/ Dự án mã nguồn/i);
    fireEvent.change(nameInput, {
      target: { value: 'Hệ thống Quản lý Khách sạn Thông minh' },
    });

    // 3. Chọn chuyên ngành
    const subMajorSelect = screen.getByLabelText(/Chuyên ngành/i);
    fireEvent.change(subMajorSelect, { target: { value: 'CNTT_KTPM' } });

    // 4. Nhập link GitHub hợp lệ
    const githubInput = screen.getByPlaceholderText('https://github.com/username/project-repository');
    fireEvent.change(githubInput, {
      target: { value: 'https://github.com/hung/hotel-system' },
    });

    // 5. Thêm tác giả
    const coAuthorInput = screen.getByPlaceholderText('Nhập họ và tên tác giả và nhấn Enter...');
    fireEvent.change(coAuthorInput, { target: { value: 'Nguyễn Văn Hùng' } });
    fireEvent.click(screen.getByRole('button', { name: 'Thêm tác giả' }));

    // 6. Submit form
    const submitBtn = screen.getByRole('button', { name: /Đăng tải dự án/i });
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    await waitFor(() => {
      expect(resourceService.uploadResource).toHaveBeenCalledTimes(1);
      expect(mockOnSuccess).toHaveBeenCalledTimes(1);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  it('hiển thị AlertBanner khi API backend trả về lỗi', async () => {
    const mockError = new axios.AxiosError('Bad Request');
    mockError.response = {
      data: { message: 'Tệp tải lên bị nghi ngờ chứa mã độc hoặc vi phạm chính sách.' },
      status: 400,
      statusText: 'Bad Request',
      headers: {},
      config: {} as InternalAxiosRequestConfig,
    };

    vi.mocked(resourceService.uploadResource).mockRejectedValueOnce(mockError);

    render(
      <UploadSourceCodeDialog
        isOpen={true}
        onClose={mockOnClose}
        fileTypes={mockFileTypes}
        subMajors={mockSubMajors}
        courses={mockCourses}
      />,
    );

    // Chọn file và nhập đầy đủ
    const fileInput = screen.getByLabelText('Tệp mã nguồn dự án');
    const mockFile = new File(['evil'], 'payload.zip', { type: 'application/zip' });
    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    const subMajorSelect = screen.getByLabelText(/Chuyên ngành/i);
    fireEvent.change(subMajorSelect, { target: { value: 'CNTT_KTPM' } });

    const coAuthorInput = screen.getByPlaceholderText('Nhập họ và tên tác giả và nhấn Enter...');
    fireEvent.change(coAuthorInput, { target: { value: 'Nguyễn Văn Hùng' } });
    fireEvent.click(screen.getByRole('button', { name: 'Thêm tác giả' }));

    const submitBtn = screen.getByRole('button', { name: /Đăng tải dự án/i });
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(await screen.findByText('Tệp tải lên bị nghi ngờ chứa mã độc hoặc vi phạm chính sách.')).toBeInTheDocument();
    expect(mockOnSuccess).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('đóng modal khi nhấp nút Hủy', () => {
    render(
      <UploadSourceCodeDialog isOpen={true} onClose={mockOnClose} subMajors={mockSubMajors} courses={mockCourses} />,
    );

    const cancelBtn = screen.getByRole('button', { name: 'Hủy' });
    fireEvent.click(cancelBtn);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
