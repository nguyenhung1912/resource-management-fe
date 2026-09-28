import { AxiosError, AxiosHeaders } from 'axios';
import { describe, expect, it } from 'vitest';
import { getApiErrorMessage } from './getApiErrorMessage';

function createAxiosError(status: number, data: unknown): AxiosError {
  const error = new AxiosError('Request failed');
  error.response = {
    data,
    status,
    statusText: 'Bad Request',
    headers: {},
    config: { headers: new AxiosHeaders() },
  };
  return error;
}

describe('getApiErrorMessage', () => {
  it('trả về fallback khi error không phải AxiosError', () => {
    expect(getApiErrorMessage(new Error('Common error'), 'Lỗi mặc định')).toBe('Lỗi mặc định');
    expect(getApiErrorMessage(null, 'Lỗi mặc định')).toBe('Lỗi mặc định');
  });

  it('trả về string khi response data là string', () => {
    const error = createAxiosError(400, 'Tài liệu không tồn tại');
    expect(getApiErrorMessage(error)).toBe('Tài liệu không tồn tại');
  });

  it('trả về message khi response data có trường message', () => {
    const error = createAxiosError(400, { message: 'Bình luận không hợp lệ' });
    expect(getApiErrorMessage(error)).toBe('Bình luận không hợp lệ');
  });

  it('trích xuất chi tiết từ errors object của ASP.NET Core ValidationProblemDetails', () => {
    const error = createAxiosError(400, {
      title: 'One or more validation errors occurred.',
      errors: {
        CommentContent: ['The CommentContent field is required.'],
      },
    });
    expect(getApiErrorMessage(error)).toBe('The CommentContent field is required.');
  });

  it('nối nhiều lỗi validation từ nhiều trường khác nhau', () => {
    const error = createAxiosError(400, {
      title: 'One or more validation errors occurred.',
      errors: {
        Content: ['Nội dung không được để trống.'],
        FileId: ['Mã tài liệu không hợp lệ.'],
      },
    });
    expect(getApiErrorMessage(error)).toBe('Nội dung không được để trống. Mã tài liệu không hợp lệ.');
  });

  it('fallback về title nếu không có errors hoặc message', () => {
    const error = createAxiosError(404, { title: 'Not Found' });
    expect(getApiErrorMessage(error)).toBe('Not Found');
  });
});
