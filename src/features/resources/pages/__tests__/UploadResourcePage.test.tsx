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

function renderUploadPage() {
  const router = createMemoryRouter(
    [
      { path: APP_PATHS.RESOURCE_UPLOAD, element: <UploadResourcePage /> },
      { path: APP_PATHS.RESOURCES_MANAGER, element: <h1>Quản lý tài nguyên</h1> },
    ],
    { initialEntries: [APP_PATHS.RESOURCE_UPLOAD] },
  );
  render(<RouterProvider router={router} />);
  return router;
}

function fillRequiredFields() {
  const file = new File(['report'], 'report.pdf', { type: 'application/pdf' });
  fireEvent.change(screen.getByLabelText('Chọn tệp tài nguyên'), { target: { files: [file] } });
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
    const file = fillRequiredFields();
    fireEvent.click(screen.getByRole('button', { name: 'Tải lên ngay' }));

    expect(screen.getByRole('button', { name: 'Đang tải lên…' })).toBeDisabled();
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
    const file = fillRequiredFields();
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
});
