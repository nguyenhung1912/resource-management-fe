import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ModerationQueuePage } from '../ModerationQueuePage';
import { moderationService } from '@/services/moderationService';
import type { ModerationQueueLoaderData } from '../../types/moderation.types';
import { APP_PATHS } from '@/constants/path';

const mockNavigate = vi.fn();
const mockRevalidate = vi.fn();
const mockSetSearchParams = vi.fn();
let mockSearchParams = new URLSearchParams();
let mockLoaderData: ModerationQueueLoaderData;

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useRevalidator: () => ({ revalidate: mockRevalidate, state: 'idle' }),
    useLoaderData: () => mockLoaderData,
    useSearchParams: () => [mockSearchParams, mockSetSearchParams],
  };
});

vi.mock('@/services/moderationService', () => ({
  default: {
    checkPlagiarism: vi.fn(),
    approveDocument: vi.fn(),
    rejectDocument: vi.fn(),
    getModerationQueue: vi.fn(),
  },
  moderationService: {
    checkPlagiarism: vi.fn(),
    approveDocument: vi.fn(),
    rejectDocument: vi.fn(),
    getModerationQueue: vi.fn(),
  },
}));

describe('ModerationQueuePage integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams();

    mockLoaderData = {
      queue: {
        items: [
          {
            fileId: 'FIL_PAGE_01',
            fileName: 'Nghiên cứu ứng dụng Deep Learning',
            fileDescription: 'Mô tả tóm tắt đề tài nghiên cứu',
            fileUrl: 'https://example.com/file1.pdf',
            fileTypeId: 1,
            fileTypeName: 'Khóa luận',
            subMajorCode: 'CNTT_KTPM',
            subMajorName: 'Kỹ thuật phần mềm',
            uploaderName: 'Nguyễn Văn A',
            uploaderEmail: 'nguyenvana@gmail.com',
            fileStatusId: 1,
            fileStatusName: 'Pending',
            createdAt: '2026-09-22T08:00:00Z',
            latestPlagiarismScore: 14.8,
          },
          {
            fileId: 'FIL_PAGE_02',
            fileName: 'Báo cáo Hệ thống IoT trong Nông nghiệp',
            fileDescription: 'Mô tả nghiên cứu cảm biến IoT',
            fileUrl: 'https://example.com/file2.pdf',
            fileTypeId: 2,
            fileTypeName: 'Báo cáo',
            subMajorCode: 'CNTT_KHMT',
            subMajorName: 'Khoa học máy tính',
            uploaderName: 'Trần Thị B',
            uploaderEmail: 'tranthib@gmail.com',
            fileStatusId: 1,
            fileStatusName: 'Pending',
            createdAt: '2026-09-23T09:00:00Z',
            latestPlagiarismScore: 35.2,
          },
        ],
        pageIndex: 1,
        pageSize: 10,
        totalCount: 2,
        totalPages: 1,
        hasPreviousPage: false,
        hasNextPage: false,
      },
      stats: {
        totalPending: 2,
        highPlagiarismRisk: 1,
        safePlagiarism: 1,
        uninspectedCount: 0,
      },
      departments: [{ id: 'DPT_IT', name: 'Công nghệ thông tin' }],
      subMajors: [{ subMajorCode: 'CNTT_KTPM', subMajorName: 'Kỹ thuật phần mềm' }],
      fileTypes: [{ id: 1, name: 'Khóa luận' }],
      currentFilters: {
        search: '',
        aiRisk: 'all',
        page: 1,
        pageSize: 10,
      },
    };
  });

  const renderComponent = () =>
    render(
      <MemoryRouter>
        <ModerationQueuePage />
      </MemoryRouter>,
    );

  it('render đầy đủ cấu trúc trang: Header, Thống kê KPI, Bộ lọc, Bảng dữ liệu', () => {
    renderComponent();

    // 1. Header
    expect(screen.getByRole('heading', { name: 'Hàng đợi kiểm duyệt tài liệu' })).toBeInTheDocument();
    expect(screen.getByText('Giảng viên / Quản trị viên')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Làm mới' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Báo cáo Đạo văn AI' })).toBeInTheDocument();

    // 2. Stats
    expect(screen.getByText('Chờ thẩm định')).toBeInTheDocument();
    expect(screen.getByText('Nguy cơ cao (>30%)')).toBeInTheDocument();
    expect(screen.getByText('An toàn (≤15%)')).toBeInTheDocument();
    expect(screen.getAllByText('Chưa quét AI').length).toBeGreaterThan(0);

    // 3. Filter
    expect(screen.getByPlaceholderText('Tìm theo tên tài liệu, người tải, mã số...')).toBeInTheDocument();

    // 4. Table
    expect(screen.getAllByText('Nghiên cứu ứng dụng Deep Learning').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Báo cáo Hệ thống IoT trong Nông nghiệp').length).toBeGreaterThan(0);
  });

  it('chuyển hướng sang trang Báo cáo Đạo văn AI khi click nút Báo cáo Đạo văn AI', () => {
    renderComponent();

    fireEvent.click(screen.getByRole('button', { name: 'Báo cáo Đạo văn AI' }));
    expect(mockNavigate).toHaveBeenCalledWith(APP_PATHS.PLAGIARISM_REPORTS);
  });

  it('kích hoạt revalidator.revalidate khi click nút Làm mới', () => {
    renderComponent();

    fireEvent.click(screen.getByRole('button', { name: 'Làm mới' }));
    expect(mockRevalidate).toHaveBeenCalledTimes(1);
  });

  it('chuyển sang trang chi tiết khi click nút Chi tiết', () => {
    renderComponent();

    const detailButtons = screen.getAllByRole('button', {
      name: `Xem chi tiết tài liệu ${mockLoaderData.queue.items[0].fileName}`,
    });
    fireEvent.click(detailButtons[0]);
    expect(mockNavigate).toHaveBeenCalledWith(APP_PATHS.MODERATION_DETAIL('FIL_PAGE_01'));
  });

  it('mở modal Phê duyệt và xử lý sau khi xác nhận duyệt thành công', async () => {
    vi.mocked(moderationService.approveDocument).mockResolvedValueOnce({
      message: 'Phê duyệt tài liệu thành công.',
      data: {
        fileId: 'FIL_PAGE_01',
        fileStatusId: 2,
        fileStatusName: 'Approved',
        moderatorUid: 'USR_MOD_01',
        decisionAt: '2026-09-24T10:00:00Z',
      },
    });

    renderComponent();

    // Click nút Duyệt
    const approveButtons = screen.getAllByRole('button', {
      name: `Phê duyệt tài liệu ${mockLoaderData.queue.items[0].fileName}`,
    });
    fireEvent.click(approveButtons[0]);

    // Modal xuất hiện
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/Phê duyệt tài liệu/i)).toBeInTheDocument();

    // Submit modal
    const submitBtn = screen.getByRole('button', { name: /Xác nhận phê duyệt/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(moderationService.approveDocument).toHaveBeenCalledWith('FIL_PAGE_01', expect.any(Object));
      expect(mockRevalidate).toHaveBeenCalled();
    });
  });

  it('mở modal Từ chối và xử lý sau khi xác nhận từ chối', async () => {
    vi.mocked(moderationService.rejectDocument).mockResolvedValueOnce({
      message: 'Từ chối tài liệu thành công.',
      data: {
        fileId: 'FIL_PAGE_02',
        fileStatusId: 3,
        fileStatusName: 'Rejected',
        moderatorUid: 'USR_MOD_01',
        decisionAt: '2026-09-24T10:05:00Z',
      },
    });

    renderComponent();

    // Click nút Từ chối của item 2
    const rejectButtons = screen.getAllByRole('button', {
      name: `Từ chối tài liệu ${mockLoaderData.queue.items[1].fileName}`,
    });
    fireEvent.click(rejectButtons[0]);

    // Modal xuất hiện
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Từ chối tài liệu/i })).toBeInTheDocument();

    // Chọn lý do từ suggestion chip (đảm bảo >= 10 ký tự)
    const chip = screen.getByText('Độ trùng lặp văn bản vượt quá ngưỡng 30%.');
    fireEvent.click(chip);

    // Submit modal
    const submitBtn = screen.getByRole('button', { name: /Xác nhận từ chối/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(moderationService.rejectDocument).toHaveBeenCalledWith(
        'FIL_PAGE_02',
        expect.objectContaining({
          reason: 'Độ trùng lặp văn bản vượt quá ngưỡng 30%.',
        }),
      );
      expect(mockRevalidate).toHaveBeenCalled();
    });
  });

  it('kích hoạt quét AI và cập nhật thông báo thành công', async () => {
    vi.mocked(moderationService.checkPlagiarism).mockResolvedValueOnce({
      message: 'Kiểm tra trùng lặp AI thành công.',
      data: {
        fileId: 'FIL_PAGE_01',
        similarityScore: 16.5,
        matchedChunks: [],
      },
    });

    renderComponent();

    const scanButtons = screen.getAllByRole('button', {
      name: `Kích hoạt quét AI cho tài liệu ${mockLoaderData.queue.items[0].fileName}`,
    });
    fireEvent.click(scanButtons[0]);

    await waitFor(() => {
      expect(moderationService.checkPlagiarism).toHaveBeenCalledWith('FIL_PAGE_01');
      expect(screen.getAllByText(/Tỷ lệ tương đồng: 16\.50%/i).length).toBeGreaterThan(0);
      expect(mockRevalidate).toHaveBeenCalled();
    });
  });

  it('cập nhật searchParams khi submit tìm kiếm', () => {
    renderComponent();

    const searchInput = screen.getByPlaceholderText('Tìm theo tên tài liệu, người tải, mã số...');
    fireEvent.change(searchInput, { target: { value: 'Deep Learning' } });
    fireEvent.click(screen.getByRole('button', { name: 'Tìm kiếm' }));

    expect(mockSetSearchParams).toHaveBeenCalled();
  });
});
