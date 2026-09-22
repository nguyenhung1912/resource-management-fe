import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { LibraryLoaderData } from '../../types/all-resources.types';
import { AllResourcesPage } from '../AllResourcesPage';

const mockRevalidate = vi.fn();
let mockSearchParams = new URLSearchParams();
const mockSetSearchParams = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useLoaderData: vi.fn(),
    useRevalidator: () => ({ revalidate: mockRevalidate, state: 'idle' }),
    useSearchParams: () => [mockSearchParams, mockSetSearchParams],
  };
});

import { useLoaderData } from 'react-router-dom';

const mockLoaderData: LibraryLoaderData = {
  resourcesResult: {
    items: [
      {
        fileId: 'LIB_RES_001',
        fileName: 'Giáo trình Cấu trúc dữ liệu và Giải thuật',
        fileDescription: 'Tài liệu học phần cơ sở ngành CNTT',
        fileUrl: 'https://example.com/res1.pdf',
        fileTypeId: 1,
        fileTypeName: 'Bài giảng / Giáo trình',
        fileSize: 10485760,
        subMajorCode: 'CNTT_KTPM',
        courseCode: 'DSA101',
        yearCompleted: 2026,
        githubLink: null,
        fileStatusName: 'Đã duyệt',
        createdAt: '2026-09-20T10:00:00Z',
      },
    ],
    totalCount: 1,
    page: 1,
    pageSize: 12,
  },
  fileTypes: [
    { id: '1', name: 'Bài giảng' },
    { id: '2', name: 'Khóa luận' },
  ],
  subMajors: [{ id: 'CNTT_KTPM', name: 'Kỹ thuật phần mềm' }],
  courses: [{ id: 'DSA101', name: 'Cấu trúc dữ liệu' }],
  fileStatuses: [{ id: '2', name: 'Đã duyệt' }],
  recommendedResources: [
    {
      fileId: 'REC_001',
      fileName: 'Đồ án Chuyên ngành Xuất sắc',
      courseName: 'Đồ án 1',
      averageScore: 4.9,
      totalReviews: 12,
      createdAt: '2026-09-20T10:00:00Z',
    },
  ],
  filters: {
    search: '',
    pageNumber: 1,
    pageSize: 12,
    viewMode: 'grid',
  },
};

describe('AllResourcesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams();
    vi.mocked(useLoaderData).mockReturnValue(mockLoaderData);
  });

  it('render đầy đủ Header, Kệ đề xuất, Tabs thể loại, Thanh lọc và Kệ sách tài nguyên', () => {
    render(
      <MemoryRouter>
        <AllResourcesPage />
      </MemoryRouter>,
    );

    // Header
    expect(screen.getByRole('heading', { level: 1, name: 'Thư viện Tài nguyên Số' })).toBeInTheDocument();
    expect(screen.getByText('1 tài liệu')).toBeInTheDocument();

    // Featured Shelf
    expect(screen.getByText('Tài liệu Nổi bật & Gợi ý cho bạn')).toBeInTheDocument();
    expect(screen.getByText('Đồ án Chuyên ngành Xuất sắc')).toBeInTheDocument();

    // File Type Tabs
    expect(screen.getByRole('tab', { name: /Tất cả học liệu/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Bài giảng/i })).toBeInTheDocument();

    // Resource Cards in Grid
    expect(screen.getByText('Giáo trình Cấu trúc dữ liệu và Giải thuật')).toBeInTheDocument();
  });

  it('gọi revalidate khi người dùng nhấn nút Làm mới ở Header', () => {
    render(
      <MemoryRouter>
        <AllResourcesPage />
      </MemoryRouter>,
    );

    const refreshButton = screen.getByRole('button', { name: 'Làm mới danh sách tài liệu' });
    fireEvent.click(refreshButton);

    expect(mockRevalidate).toHaveBeenCalledTimes(1);
  });

  it('render dạng bảng Mục lục khi viewMode là table', () => {
    mockSearchParams = new URLSearchParams('viewMode=table');

    render(
      <MemoryRouter>
        <AllResourcesPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('Chuyên ngành / Học phần')).toBeInTheDocument();
  });

  it('hiển thị LibraryEmptyState khi danh sách tài nguyên trống', () => {
    vi.mocked(useLoaderData).mockReturnValue({
      ...mockLoaderData,
      resourcesResult: {
        items: [],
        totalCount: 0,
        page: 1,
        pageSize: 12,
      },
    });

    render(
      <MemoryRouter>
        <AllResourcesPage />
      </MemoryRouter>,
    );

    expect(screen.getByText('Không tìm thấy tài liệu trong thư viện')).toBeInTheDocument();
  });
});
