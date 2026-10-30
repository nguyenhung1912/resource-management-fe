import axios from 'axios';
import { getApiErrorMessage } from '@/utils/getApiErrorMessage';
import { UncertainUploadError } from '@/features/processing/utils/acceptedJob';

export function uploadErrorMessage(error: unknown): string {
  if (
    error instanceof UncertainUploadError ||
    (axios.isAxiosError(error) && (!error.response || error.response.status >= 500))
  ) {
    return 'Chưa xác nhận được kết quả tiếp nhận. Máy chủ có thể đã nhận tài liệu; hãy mở Tài liệu của tôi và kiểm tra trạng thái trước khi gửi lại. Không tự động tải lại tệp.';
  }
  return getApiErrorMessage(error, 'Tải tài nguyên thất bại.');
}
