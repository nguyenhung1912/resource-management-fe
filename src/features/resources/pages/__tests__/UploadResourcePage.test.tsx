import { jobFixture } from '@/features/processing/components/__tests__/fixtures';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { AxiosResponse } from 'axios';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { APP_PATHS } from '@/constants/path';
import axiosClient from '@/services/axiosClient';
import { UploadResourcePage } from '../UploadResourcePage';

vi.mock('@/services/axiosClient', () => ({
  default: { post: vi.fn() },
}));

const defaultCatalog = {
  departments: [{ id: 'DEPT-001', name: 'Khoa Công nghệ Thông tin' }],
  majors: [{ majorId: 'MAJOR-001', majorName: 'Kỹ thuật Phần mềm', departmentId: 'DEPT-001' }],
  subMajors: [{ subMajorCode: 'SE', subMajorName: 'Kỹ thuật phần mềm', majorId: 'MAJOR-001' }],
  courses: [{ courseCode: 'PRN222', courseName: 'Lập trình .NET', subMajorCode: 'SE' }],
  fileTypes: [{ id: 1, name: 'Báo cáo nghiên cứu' }],
};

function renderUploadPage(loaderData = defaultCatalog) {
  const router = createMemoryRouter(
    [
      {
        path: APP_PATHS.RESOURCE_UPLOAD,
        element: <UploadResourcePage />,
        loader: () => loaderData,
      },
      { path: APP_PATHS.RESOURCES_MANAGER, element: <h1>Quản lý tài nguyên</h1> },
      { path: APP_PATHS.PROCESSING_JOB(jobFixture.jobId), element: <h1>Theo dõi job đã tiếp nhận</h1> },
    ],
    { initialEntries: [APP_PATHS.RESOURCE_UPLOAD] },
  );
  render(<RouterProvider router={router} />);
  return router;
}

async function fillRequiredFields() {
  const fileInput = await screen.findByLabelText('Chọn tệp tài nguyên');
  const file = new File(['report'], 'report.pdf', { type: 'application/pdf' });
  fireEvent.change(fileInput, { target: { files: [file] } });
  fireEvent.change(screen.getByLabelText(/loại tài nguyên/i), { target: { value: '1' } });
  fireEvent.change(screen.getByLabelText(/chuyên ngành/i), { target: { value: 'SE' } });
  const authorInput = screen.getByRole('textbox', { name: /nhập tác giả/i });
  fireEvent.change(authorInput, { target: { value: 'Nguyễn Văn An' } });
  fireEvent.keyDown(authorInput, { key: 'Enter' });
  fireEvent.change(screen.getByLabelText(/đính kèm mã nguồn/i), {
    target: { value: 'https://github.com/example/report' },
  });
  return file;
}

describe('UploadResourcePage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('gửi multipart đúng DTO và chỉ quay về trang quản lý khi BE xác nhận thành công', async () => {
    let completeUpload!: (response: Pick<AxiosResponse<unknown>, 'data'>) => void;
    vi.mocked(axiosClient.post).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          completeUpload = resolve;
        }),
    );
    const router = renderUploadPage();
    expect(axiosClient.post).not.toHaveBeenCalled();
    const file = await fillRequiredFields();
    fireEvent.click(screen.getByRole('button', { name: 'Tải lên ngay' }));

    expect(screen.getByRole('button', { name: 'Đang tải lên…' })).toBeDisabled();
    expect(screen.getByRole('status')).toHaveTextContent('kiểm tra trùng lặp');
    expect(screen.getByLabelText(/tên tài nguyên/i)).toBeDisabled();
    expect(router.state.location.pathname).toBe(APP_PATHS.RESOURCE_UPLOAD);
    const call = vi.mocked(axiosClient.post).mock.calls[0];
    expect(call?.[0]).toBe('/api/Resources');
    const body: unknown = call?.[1];
    expect(body).toBeInstanceOf(FormData);
    if (!(body instanceof FormData)) throw new Error('Upload phải sử dụng FormData');
    expect(body.get('File')).toBe(file);
    expect(body.get('FileName')).toBe('report');
    expect(body.getAll('AuthorNames')).toEqual(['Nguyễn Văn An']);
    expect(body.get('GithubLink')).toBe('https://github.com/example/report');
    expect(body.has('AuthorIds')).toBe(false);
    expect(body.has('Keywords')).toBe(false);
    fireEvent.submit(screen.getByLabelText(/tên tài nguyên/i).closest('form')!);
    expect(axiosClient.post).toHaveBeenCalledTimes(1);

    await act(async () => {
      completeUpload({ data: { message: 'Tải tài liệu thành công.' } });
    });

    await waitFor(() => expect(router.state.location.pathname).toBe(APP_PATHS.RESOURCES_MANAGER));
    expect(router.state.location.state).toEqual({ resourceUploadSucceeded: true });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('giữ file và thông tin khi BE báo lỗi, cho phép gửi lại thành công', async () => {
    vi.mocked(axiosClient.post)
      .mockRejectedValueOnce({
        isAxiosError: true,
        response: { status: 400, data: { message: 'Mã chuyên ngành không hợp lệ.' } },
      })
      .mockResolvedValueOnce({ data: { message: 'Tải tài liệu thành công.' } });
    const router = renderUploadPage();
    const file = await fillRequiredFields();
    fireEvent.click(screen.getByRole('button', { name: 'Tải lên ngay' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Mã chuyên ngành không hợp lệ.');
    expect(router.state.location.pathname).toBe(APP_PATHS.RESOURCE_UPLOAD);
    expect(screen.getByText('report.pdf')).toBeInTheDocument();
    expect(screen.getByLabelText(/tên tài nguyên/i)).toHaveValue('report');
    expect(screen.getByRole('button', { name: 'Tải lên ngay' })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: 'Tải lên ngay' }));

    await waitFor(() => expect(router.state.location.pathname).toBe(APP_PATHS.RESOURCES_MANAGER));
    expect(axiosClient.post).toHaveBeenCalledTimes(2);
    const retriedBody: unknown = vi.mocked(axiosClient.post).mock.calls[1]?.[1];
    if (!(retriedBody instanceof FormData)) throw new Error('Upload phải sử dụng FormData');
    expect(retriedBody.get('File')).toBe(file);
  });

  it.each([409, 503])('hiển thị đúng thông báo backend cho HTTP %i và không tự gửi lại', async (status) => {
    vi.mocked(axiosClient.post).mockRejectedValueOnce({
      isAxiosError: true,
      response: { status, data: { message: 'Không thể nhận tài liệu.' } },
    });
    const router = renderUploadPage();
    await fillRequiredFields();
    fireEvent.click(screen.getByRole('button', { name: 'Tải lên ngay' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      status === 503 ? 'hãy mở Tài liệu của tôi' : 'Không thể nhận tài liệu.',
    );
    expect(axiosClient.post).toHaveBeenCalledTimes(1);
    expect(router.state.location.pathname).toBe(APP_PATHS.RESOURCE_UPLOAD);
  });

  it('hiển thị đầy đủ danh mục học thuật (khoa, ngành, chuyên ngành, học phần) khi có dữ liệu loader', async () => {
    const mockLoaderData = {
      departments: [{ id: 'DEPT-001', name: 'Khoa Công nghệ Thông tin' }],
      majors: [{ majorId: 'MAJOR-001', majorName: 'Kỹ thuật Phần mềm', departmentId: 'DEPT-001' }],
      subMajors: [{ subMajorCode: 'SM-SE', subMajorName: 'Công nghệ Phần mềm', majorId: 'MAJOR-001' }],
      courses: [{ courseCode: 'COURSE-001', courseName: 'Lập trình C#', subMajorCode: 'SM-SE' }],
      fileTypes: [{ id: 10, name: 'Tài liệu thí nghiệm' }],
    };

    const router = createMemoryRouter(
      [
        {
          path: APP_PATHS.RESOURCE_UPLOAD,
          element: <UploadResourcePage />,
          loader: () => mockLoaderData,
        },
        { path: APP_PATHS.RESOURCES_MANAGER, element: <h1>Quản lý tài nguyên</h1> },
        { path: APP_PATHS.PROCESSING_JOB(jobFixture.jobId), element: <h1>Theo dõi job đã tiếp nhận</h1> },
      ],
      { initialEntries: [APP_PATHS.RESOURCE_UPLOAD] },
    );
    render(<RouterProvider router={router} />);

    expect(await screen.findByRole('dialog', { name: 'Tải lên tài nguyên mới' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Khoa Công nghệ Thông tin' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Kỹ thuật Phần mềm' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Công nghệ Phần mềm (SM-SE)' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'COURSE-001 - Lập trình C#' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Tài liệu thí nghiệm' })).toBeInTheDocument();
  });
  it('follows the accepted job without claiming publication or replaying the upload', async () => {
    vi.mocked(axiosClient.post).mockResolvedValueOnce({ status: 202, data: { data: { processingJob: jobFixture } } });
    const router = renderUploadPage();
    await fillRequiredFields();
    fireEvent.click(screen.getByRole('button', { name: 'Tải lên ngay' }));
    await waitFor(() => expect(router.state.location.pathname).toBe(APP_PATHS.PROCESSING_JOB(jobFixture.jobId)));
    expect(router.state.location.state).toBeNull();
    expect(axiosClient.post).toHaveBeenCalledTimes(1);
  });

  it.each(['foreign-url', 'missing-job', 'network-timeout'])(
    'requires reconciliation after uncertain acceptance: %s',
    async (kind) => {
      if (kind === 'network-timeout') {
        vi.mocked(axiosClient.post).mockRejectedValueOnce({ isAxiosError: true, code: 'ECONNABORTED' });
      } else {
        const job =
          kind === 'foreign-url' ? { ...jobFixture, statusUrl: 'https://untrusted.example/status' } : undefined;
        vi.mocked(axiosClient.post).mockResolvedValueOnce({ status: 202, data: { data: { processingJob: job } } });
      }
      const router = renderUploadPage();
      await fillRequiredFields();
      fireEvent.click(screen.getByRole('button', { name: 'Tải lên ngay' }));
      expect(await screen.findByRole('alert')).toHaveTextContent('hãy mở Tài liệu của tôi');
      expect(axiosClient.post).toHaveBeenCalledTimes(1);
      expect(router.state.location.pathname).toBe(APP_PATHS.RESOURCE_UPLOAD);
      expect(screen.getByText('report.pdf')).toBeInTheDocument();
    },
  );
});
