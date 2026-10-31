import { APP_PATHS } from '@/constants/path';
import { processingService } from '@/services/processingService';
import type { QueuedCheckEnvelope as PlagiarismCheckEnvelopeResponse } from '../../types/queued-check.types';
import { jobFixture } from '@/features/processing/components/__tests__/fixtures';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DocumentModerationDetailPage } from '../DocumentModerationDetailPage';
import { moderationService } from '@/services/moderationService';
import type { ModerationDecisionEnvelopeResponse, ModerationDetailLoaderData } from '../../types/moderation.types';

const mockNavigate = vi.fn();
const mockRevalidate = vi.fn();
let mockLoaderData: ModerationDetailLoaderData;

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLoaderData: () => mockLoaderData,
    useRevalidator: () => ({ revalidate: mockRevalidate, state: 'idle' }),
  };
});

vi.mock('@/services/processingService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/processingService')>();
  return { ...actual, processingService: { ...actual.processingService, resourceState: vi.fn() } };
});

vi.mock('@/services/moderationService', () => ({
  moderationService: {
    checkPlagiarism: vi.fn(),
    approveDocument: vi.fn(),
    rejectDocument: vi.fn(),
  },
}));

afterEach(() => vi.unstubAllEnvs());

describe('DocumentModerationDetailPage integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('VITE_AUTOMATIC_PROCESSING_ENABLED', 'true');
    vi.stubEnv('VITE_LEGACY_MANUAL_MODERATION_ENABLED', 'true');
    vi.mocked(processingService.resourceState).mockImplementation(async (fileId) => ({
      fileId,
      businessStatus: 'Pending',
      currentCheckId: null,
      activeJob: null,
      publicationReadiness: null,
      supportsDurableProcessing: false,
      canOwnerRecheck: false,
      canReviewerCheck: false,
    }));

    mockLoaderData = {
      detail: {
        fileId: 'FIL_INTEGRATION_001',
        fileName: 'Nghiên cứu ứng dụng Transformer trong NLP',
        fileDescription: 'Mô tả chi tiết kiến trúc Transformer và ứng dụng trong xử lý tiếng Việt.',
        fileUrl: 'https://example.com/files/transformer.pdf',
        fileTypeId: 1,
        fileTypeName: 'Báo cáo NCKH',
        subMajorCode: 'CNTT_KTPM',
        subMajorName: 'Kỹ thuật phần mềm',
        departmentName: 'Khoa Công nghệ thông tin',
        uploader: {
          uid: 'USR_STUDENT_01',
          fullName: 'Đặng Minh Khang',
          email: 'khang.dang@student.edu.vn',
        },
        authors: [
          {
            authorId: 'USR_STUDENT_01',
            fullName: 'Đặng Minh Khang',
            email: 'khang.dang@student.edu.vn',
            affiliation: 'Trường Đại học Quy Nhơn',
          },
          {
            authorId: 'USR_LECTURER_02',
            fullName: 'TS. Nguyễn Văn Hướng Dẫn',
            email: 'huongdan@university.edu.vn',
          },
        ],
        createdAt: '2026-09-12T08:00:00Z',
        latestPlagiarismCheck: {
          fileId: 'FIL_INTEGRATION_001',
          similarityScore: 16.5,
          checkedAt: '2026-09-12T09:00:00Z',
          matchedChunks: [
            {
              chunkIndex: 1,
              sourceFileName: 'Khóa luận K18 NLP',
              similarity: 75.4,
              contentSnippet: 'Mô hình Transformer sử dụng cơ chế Self-Attention...',
            },
          ],
        },
      },
      history: [
        {
          historyId: 'MDH_OLD_01',
          action: 'Reject',
          moderatorName: 'TS. Trần Văn Thầy',
          reason: 'Độ tương đồng cao ở phần lý thuyết tổng quan.',
          notes: 'Vui lòng bổ sung trích dẫn cho các công thức.',
          plagiarismScore: 32.5,
          createdAt: '2026-09-10T14:00:00Z',
        },
      ],
    };
  });

  it('render đầy đủ cấu trúc màn hình: Header, Metadata, Viewer, Plagiarism Panel và History', () => {
    render(
      <MemoryRouter>
        <DocumentModerationDetailPage />
      </MemoryRouter>,
    );

    // Header
    expect(
      screen.getByRole('heading', { level: 1, name: 'Nghiên cứu ứng dụng Transformer trong NLP' }),
    ).toBeInTheDocument();
    expect(screen.getByText('#FIL_INTEGRATION_001')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Quét trùng lặp AI/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Phê duyệt/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Từ chối/i })).toBeInTheDocument();

    // Metadata Card
    expect(screen.getByText('Hồ sơ Học thuật & Đăng ký')).toBeInTheDocument();
    expect(screen.getByText('Khoa Công nghệ thông tin')).toBeInTheDocument();
    expect(screen.getAllByText(/Kỹ thuật phần mềm/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Đặng Minh Khang').length).toBeGreaterThanOrEqual(1);

    // File Viewer
    expect(screen.getByTitle('Trình xem tài liệu: Nghiên cứu ứng dụng Transformer trong NLP')).toBeInTheDocument();

    // Plagiarism Panel
    expect(screen.getByText('Phân tích Trùng lặp & Đạo văn AI')).toBeInTheDocument();
    expect(screen.getByText('16.5%')).toBeInTheDocument();
    expect(screen.getByText(/Mức độ An toàn \(Trùng lặp thấp\)/i)).toBeInTheDocument();
    expect(screen.getAllByText('Khóa luận K18 NLP').length).toBeGreaterThan(0);

    // History Timeline
    expect(screen.getByText(/Nhật ký Kiểm duyệt & Lịch sử \(1\)/i)).toBeInTheDocument();
    expect(screen.getByText('Kiểm duyệt viên: TS. Trần Văn Thầy')).toBeInTheDocument();
  });

  it('kích hoạt quét AI và cập nhật kết quả cùng thông báo thành công', async () => {
    const mockScanResponse: PlagiarismCheckEnvelopeResponse = {
      message: 'Đã tiếp nhận yêu cầu.',
      data: { ...jobFixture, fileId: 'FIL_INTEGRATION_001' },
    };

    vi.mocked(moderationService.checkPlagiarism).mockResolvedValueOnce(mockScanResponse);

    render(
      <MemoryRouter>
        <DocumentModerationDetailPage />
      </MemoryRouter>,
    );

    const scanButton = screen.getByRole('button', { name: /Quét trùng lặp AI/i });
    fireEvent.click(scanButton);

    await waitFor(() => {
      expect(moderationService.checkPlagiarism).toHaveBeenCalledWith('FIL_INTEGRATION_001', expect.any(String));
    });

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith(APP_PATHS.PROCESSING_JOB(jobFixture.jobId)));
    expect(screen.queryByText('Quét trùng lặp AI hoàn tất')).not.toBeInTheDocument();
    expect(screen.queryByText('11.2%')).not.toBeInTheDocument();
  });

  it('mở modal Phê duyệt và xử lý sau khi xác nhận phê duyệt thành công', async () => {
    const mockDecisionResponse: ModerationDecisionEnvelopeResponse = {
      message: 'Phê duyệt tài liệu thành công.',
      data: {
        fileId: 'FIL_INTEGRATION_001',
        fileStatusId: 2,
        fileStatusName: 'Approved',
        moderatorUid: 'USR_LECTURER_01',
        decisionAt: '2026-09-13T10:30:00Z',
        notes: 'Tài liệu đạt yêu cầu chuẩn.',
      },
    };

    vi.mocked(moderationService.approveDocument).mockResolvedValueOnce(mockDecisionResponse);

    render(
      <MemoryRouter>
        <DocumentModerationDetailPage />
      </MemoryRouter>,
    );

    // Mở modal Phê duyệt
    const approveHeaderBtn = screen.getByRole('button', { name: /^Phê duyệt$/i });
    fireEvent.click(approveHeaderBtn);

    // Modal hiển thị
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Phê duyệt tài liệu' })).toBeInTheDocument();

    // Nhập ghi chú và submit
    const notesInput = screen.getByPlaceholderText(/Nhập ghi chú hoặc lời nhận xét dành cho tài liệu/i);
    fireEvent.change(notesInput, { target: { value: 'Tài liệu đạt yêu cầu chuẩn.' } });

    const confirmBtn = screen.getByRole('button', { name: /Xác nhận Phê duyệt/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(moderationService.approveDocument).toHaveBeenCalledWith('FIL_INTEGRATION_001', {
        notes: 'Tài liệu đạt yêu cầu chuẩn.',
      });
    });

    // Modal đóng và hiển thị banner thông báo
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Phê duyệt tài liệu thành công')).toBeInTheDocument();
    expect(mockRevalidate).toHaveBeenCalledTimes(1);
  });

  it('mở modal Từ chối và xử lý sau khi xác nhận từ chối', async () => {
    const mockDecisionResponse: ModerationDecisionEnvelopeResponse = {
      message: 'Từ chối tài liệu thành công.',
      data: {
        fileId: 'FIL_INTEGRATION_001',
        fileStatusId: 3,
        fileStatusName: 'Rejected',
        moderatorUid: 'USR_LECTURER_01',
        decisionAt: '2026-09-13T10:45:00Z',
        notes: 'Xem lại trích dẫn.',
      },
    };

    vi.mocked(moderationService.rejectDocument).mockResolvedValueOnce(mockDecisionResponse);

    render(
      <MemoryRouter>
        <DocumentModerationDetailPage />
      </MemoryRouter>,
    );

    // Mở modal Từ chối
    const rejectHeaderBtn = screen.getByRole('button', { name: /^Từ chối$/i });
    fireEvent.click(rejectHeaderBtn);

    // Modal hiển thị
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Từ chối tài liệu nghiên cứu' })).toBeInTheDocument();

    // Điền lý do từ chối (>= 10 ký tự)
    const reasonInput = screen.getByPlaceholderText(/Nhập lý do từ chối chi tiết/i);
    fireEvent.change(reasonInput, {
      target: { value: 'Nội dung trích dẫn chưa đúng quy cách IEEE và thiếu nguồn tham khảo.' },
    });

    const confirmBtn = screen.getByRole('button', { name: /Xác nhận Từ chối/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(moderationService.rejectDocument).toHaveBeenCalledWith('FIL_INTEGRATION_001', {
        reason: 'Nội dung trích dẫn chưa đúng quy cách IEEE và thiếu nguồn tham khảo.',
        notes: undefined,
        plagiarismScore: 16.5,
      });
    });

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Đã từ chối tài liệu')).toBeInTheDocument();
    expect(mockRevalidate).toHaveBeenCalledTimes(1);
  });
  it('blocks legacy decisions on a durable document without calling a decision endpoint', async () => {
    vi.mocked(processingService.resourceState).mockResolvedValueOnce({
      fileId: 'FIL_INTEGRATION_001',
      businessStatus: 'Pending',
      currentCheckId: null,
      activeJob: jobFixture,
      publicationReadiness: null,
      supportsDurableProcessing: true,
      canOwnerRecheck: false,
      canReviewerCheck: false,
    });
    render(
      <MemoryRouter>
        <DocumentModerationDetailPage />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole('button', { name: /^Phê duyệt$/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Không thể duyệt hoặc từ chối thủ công');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(moderationService.approveDocument).not.toHaveBeenCalled();
  });

  it('hides legacy decisions by default and fails closed when metadata cannot be loaded', async () => {
    vi.stubEnv('VITE_LEGACY_MANUAL_MODERATION_ENABLED', 'false');
    const view = render(
      <MemoryRouter>
        <DocumentModerationDetailPage />
      </MemoryRouter>,
    );
    expect(screen.queryByRole('button', { name: /^Phê duyệt$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Từ chối$/i })).not.toBeInTheDocument();
    vi.stubEnv('VITE_LEGACY_MANUAL_MODERATION_ENABLED', 'true');
    vi.mocked(processingService.resourceState).mockRejectedValueOnce(new Error('offline'));
    view.rerender(
      <MemoryRouter>
        <DocumentModerationDetailPage />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole('button', { name: /^Từ chối$/i }));
    await screen.findByRole('alert');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(moderationService.rejectDocument).not.toHaveBeenCalled();
  });
});
