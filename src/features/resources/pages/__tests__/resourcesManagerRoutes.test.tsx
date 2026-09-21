import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { APP_PATHS } from '@/constants/path';
import { appRoutes } from '@/routes';
import { useAuthStore } from '@/store/authStore';
import { resourceService } from '@/services/resourceService';
import type { MyUploadItemResponse } from '@/features/resources/types/resource.types';

const authenticatedState = {
  user: {
    uid: 'test-lecturer',
    userCode: 'lecturer_test',
    fullName: 'Test Lecturer',
    email: 'lecturer@test.com',
    roleId: 3,
    role: 'Lecturer',
  },
  token: 'valid-token',
  expiration: '2099-12-31T23:59:59Z',
  isAuthenticated: true,
  isLoading: false,
} satisfies Partial<ReturnType<typeof useAuthStore.getState>>;

const unauthenticatedState = {
  user: null,
  token: null,
  expiration: null,
  isAuthenticated: false,
  isLoading: false,
} satisfies Partial<ReturnType<typeof useAuthStore.getState>>;

const mockUploadItem: MyUploadItemResponse = {
  fileId: 'resource-1',
  fileName: 'Báo cáo thực tập_Final.pdf',
  fileTypeName: 'Báo cáo',
  fileSize: 2_516_582,
  createdAt: '2024-05-12T08:00:00.000Z',
  fileStatusId: 1,
  fileStatusName: 'Đã duyệt',
  majorId: 'CNTT',
  majorName: 'Công nghệ thông tin',
  subMajorName: 'Kỹ thuật phần mềm',
  courseName: 'Thực tập doanh nghiệp',
  keywords: ['thực tập', 'báo cáo'],
  authors: [{ id: 'author-1', fullName: 'Nguyễn Văn A' }],
};

describe('resources manager routes', () => {
  beforeEach(() => {
    useAuthStore.setState(authenticatedState);
    vi.restoreAllMocks();
  });

  afterEach(() => {
    useAuthStore.setState(unauthenticatedState);
  });

  it('hiển thị danh sách tài nguyên và các công cụ quản lý khi có dữ liệu từ backend', async () => {
    vi.spyOn(resourceService, 'getMyUploads').mockImplementation(async (filter) => {
      if (filter?.fileStatusId === 1) {
        return { items: [], totalCount: 10, pageNumber: 1, pageSize: 1, totalPages: 10 };
      }
      if (filter?.fileStatusId === 2) {
        return { items: [], totalCount: 5, pageNumber: 1, pageSize: 1, totalPages: 5 };
      }
      if (filter?.fileStatusId === 3) {
        return { items: [], totalCount: 2, pageNumber: 1, pageSize: 1, totalPages: 2 };
      }
      return {
        items: [mockUploadItem],
        totalCount: 1,
        pageNumber: 1,
        pageSize: 10,
        totalPages: 1,
      };
    });

    const router = createMemoryRouter(appRoutes, { initialEntries: [APP_PATHS.RESOURCES_MANAGER] });

    render(<RouterProvider router={router} />);

    const heading = await screen.findByRole('heading', { name: 'Quản lý tài nguyên' }, { timeout: 10000 });
    const statistics = screen.getByRole('region', { name: 'Thống kê tài nguyên' });
    const resourceTable = await screen.findByRole('table', { name: 'Danh sách tài nguyên đã tải lên' });

    expect(statistics).toHaveTextContent('Đã duyệt10');
    expect(statistics).toHaveTextContent('Chờ duyệt5');
    expect(statistics).toHaveTextContent('Bị từ chối2');
    expect(heading.compareDocumentPosition(statistics) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(statistics.compareDocumentPosition(resourceTable) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getByText('Báo cáo thực tập_Final.pdf')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Lọc tài nguyên' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Sắp xếp tài nguyên' })).toBeInTheDocument();
    expect(screen.getByRole('banner', { name: 'Thanh điều hướng dashboard' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Tải lên tài nguyên' })).toHaveAttribute('href', APP_PATHS.RESOURCE_UPLOAD);
    expect(screen.getByRole('link', { name: 'Chỉnh sửa Báo cáo thực tập_Final.pdf' })).toHaveAttribute(
      'href',
      APP_PATHS.RESOURCE_EDIT('resource-1'),
    );
  });

  it('hiển thị trạng thái rỗng và số liệu 0 khi không có dữ liệu tài nguyên nào', async () => {
    vi.spyOn(resourceService, 'getMyUploads').mockResolvedValue({
      items: [],
      totalCount: 0,
      pageNumber: 1,
      pageSize: 10,
      totalPages: 0,
    });

    const router = createMemoryRouter(appRoutes, { initialEntries: [APP_PATHS.RESOURCES_MANAGER] });

    render(<RouterProvider router={router} />);

    await screen.findByRole('heading', { name: 'Quản lý tài nguyên' }, { timeout: 10000 });
    const statistics = screen.getByRole('region', { name: 'Thống kê tài nguyên' });

    expect(statistics).toHaveTextContent('Đã duyệt0');
    expect(statistics).toHaveTextContent('Chờ duyệt0');
    expect(statistics).toHaveTextContent('Bị từ chối0');
    expect(await screen.findByText('Chưa có tài nguyên nào')).toBeInTheDocument();
    expect(
      screen.getByText('Bạn chưa tải lên tài nguyên nào lên hệ thống. Hãy bắt đầu chia sẻ tài liệu ngay bây giờ.'),
    ).toBeInTheDocument();
  });

  it('mở popup tại route upload và quay về trang cha khi hủy', async () => {
    vi.spyOn(resourceService, 'getMyUploads').mockResolvedValue({
      items: [],
      totalCount: 0,
      pageNumber: 1,
      pageSize: 10,
      totalPages: 0,
    });

    const router = createMemoryRouter(appRoutes, { initialEntries: [APP_PATHS.RESOURCE_UPLOAD] });

    render(<RouterProvider router={router} />);

    expect(
      await screen.findByRole('dialog', { name: 'Tải lên tài nguyên mới' }, { timeout: 10000 }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Hủy' }));

    await waitFor(() => expect(router.state.location.pathname).toBe(APP_PATHS.RESOURCES_MANAGER));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Quản lý tài nguyên' })).toBeInTheDocument();
  });

  it('mở form chỉnh sửa theo resource id và quay về trang quản lý khi hủy', async () => {
    vi.spyOn(resourceService, 'getMyUploads').mockResolvedValue({
      items: [],
      totalCount: 0,
      pageNumber: 1,
      pageSize: 10,
      totalPages: 0,
    });

    const router = createMemoryRouter(appRoutes, { initialEntries: [APP_PATHS.RESOURCE_EDIT('resource-1')] });

    render(<RouterProvider router={router} />);

    const dialog = await screen.findByRole('dialog', { name: 'Chỉnh sửa tài nguyên' }, { timeout: 10000 });
    expect(within(dialog).getByText('Báo cáo thực tập_Final.pdf')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Hủy' }));

    await waitFor(() => expect(router.state.location.pathname).toBe(APP_PATHS.RESOURCES_MANAGER));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
