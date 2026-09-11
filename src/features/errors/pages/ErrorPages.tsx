import { FileQuestion, LockKeyhole, ServerCrash, ShieldX } from 'lucide-react';
import { ErrorStatePage } from './ErrorStatePage';

export function UnauthorizedPage() {
  return (
    <ErrorStatePage
      code="401"
      title="Không có quyền truy cập"
      description="Tính năng này bạn không có quyền truy cập hoặc không có quyền đăng nhập."
      icon={LockKeyhole}
      primaryAction="login"
      tone="warning"
    />
  );
}

export function ForbiddenPage() {
  return (
    <ErrorStatePage
      code="403"
      title="Bạn không có quyền truy cập"
      description="Tài khoản của bạn không có quyền xem nội dung này. Hãy quay lại hoặc liên hệ quản trị viên."
      icon={ShieldX}
      primaryAction="back"
      tone="warning"
    />
  );
}

export function NotFoundPage() {
  return (
    <ErrorStatePage
      code="404"
      title="Không tìm thấy trang"
      description="Trang bạn đang tìm kiếm không tồn tại, đã được di chuyển hoặc đường dẫn không chính xác."
      icon={FileQuestion}
      primaryAction="back"
      tone="warning"
    />
  );
}

export function ServerErrorPage() {
  return (
    <ErrorStatePage
      code="500"
      title="Đã xảy ra lỗi hệ thống"
      description="Hệ thống đang gặp sự cố, xin lỗi vì sự bất tiện này."
      icon={ServerCrash}
      primaryAction="retry"
      tone="danger"
    />
  );
}
