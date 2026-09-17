import { FileQuestion, LockKeyhole, ServerCrash, ShieldAlert } from 'lucide-react';
import { ErrorStatePage } from './ErrorStatePage';

export function UnauthorizedPage() {
  return (
    <ErrorStatePage
      code="401"
      title="Không có quyền truy cập"
      description="Tính năng này bạn không có quyền truy cập hoặc không có quyền đăng nhập."
      suggestion="Phiên làm việc của bạn có thể đã hết hạn hoặc chưa được xác thực. Vui lòng đăng nhập tài khoản để tiếp tục."
      icon={LockKeyhole}
      primaryAction="login"
      tone="primary"
    />
  );
}

export function ForbiddenPage() {
  return (
    <ErrorStatePage
      code="403"
      title="Bạn không có quyền truy cập"
      description="Tài khoản của bạn không có quyền xem nội dung này. Hãy quay lại hoặc liên hệ quản trị viên."
      suggestion="Khu vực này yêu cầu phân quyền Giảng viên hoặc Quản trị viên. Hãy kiểm tra lại vai trò tài khoản được cấp phép."
      icon={ShieldAlert}
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
      suggestion="Đường dẫn URL có thể đã thay đổi hoặc tài nguyên đã bị xóa. Hãy kiểm tra lại liên kết hoặc quay về trang chủ."
      icon={FileQuestion}
      primaryAction="back"
      tone="primary"
    />
  );
}

export function ServerErrorPage() {
  return (
    <ErrorStatePage
      code="500"
      title="Đã xảy ra lỗi hệ thống"
      description="Hệ thống đang gặp sự cố, xin lỗi vì sự bất tiện này."
      suggestion="Đội ngũ kỹ thuật đã nhận được thông báo lỗi. Bạn có thể nhấn 'Thử lại' sau giây lát hoặc liên hệ ban quản trị."
      icon={ServerCrash}
      primaryAction="retry"
      tone="danger"
    />
  );
}
