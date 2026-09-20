import { Link, Navigate } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  FileQuestion,
  Files,
  Plus,
  Scale,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Upload,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { buttonVariants } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { APP_PATHS } from '@/constants/path';
import { useAuthStore } from '@/store/authStore';

const QUICK_ACTIONS = [
  {
    title: 'Quản lý Tài nguyên',
    description: 'Theo dõi, tìm kiếm và chỉnh sửa các tài liệu học tập, giáo trình đã tải lên hệ thống.',
    href: APP_PATHS.RESOURCES_MANAGER,
    icon: Files,
    iconBg: 'bg-primary/10 text-primary',
    tag: 'Tài nguyên',
  },
  {
    title: 'Tải lên Tài nguyên mới',
    description: 'Đăng tải tài liệu, đề cương, bài giảng hoặc báo cáo nghiên cứu khoa học vào kho lưu trữ.',
    href: APP_PATHS.RESOURCE_UPLOAD,
    icon: Upload,
    iconBg: 'bg-emerald-50 text-success',
    tag: 'Đăng tải',
  },
  {
    title: 'Khiếu nại của tôi',
    description: 'Theo dõi tiến trình xử lý các khiếu nại tài liệu bị từ chối hoặc yêu cầu xem xét lại.',
    href: APP_PATHS.APPEALS,
    icon: FileQuestion,
    iconBg: 'bg-amber-50 text-warning',
    tag: 'Khiếu nại',
  },
  {
    title: 'Tiếp nhận Khiếu nại',
    description: 'Hội đồng thẩm định và Giảng viên tiếp nhận giải quyết các yêu cầu khiếu nại được giao.',
    href: APP_PATHS.ASSIGNED_APPEALS,
    icon: Scale,
    iconBg: 'bg-purple-50 text-purple-600',
    tag: 'Thẩm định',
  },
  {
    title: 'Báo cáo Vi phạm',
    description: 'Tiếp nhận, thẩm tra và xử lý các phản ánh vi phạm bản quyền và quy chế tài liệu.',
    href: APP_PATHS.REPORTS_MANAGER,
    icon: ShieldAlert,
    iconBg: 'bg-rose-50 text-danger',
    tag: 'Kiểm tra',
  },
  {
    title: 'Báo cáo Đạo văn AI',
    description: 'Phân tích tỷ lệ tương đồng văn bản, phát hiện trùng lặp tự động bằng trí tuệ nhân tạo.',
    href: APP_PATHS.PLAGIARISM_REPORTS,
    icon: Sparkles,
    iconBg: 'bg-blue-50 text-primary',
    tag: 'AI Scanning',
  },
];

const PLATFORM_METRICS = [
  {
    label: 'Tài nguyên học liệu',
    value: '1,000+',
    detail: 'Giáo trình, bài giảng và đề tài số hóa',
    icon: BookOpen,
  },
  {
    label: 'Thời gian phản hồi',
    value: '24h - 48h',
    detail: 'Tốc độ giải quyết khiếu nại trung bình',
    icon: Clock,
  },
  {
    label: 'Kiểm duyệt tự động AI',
    value: '100%',
    detail: 'Tất cả tài liệu được quét tương đồng',
    icon: Sparkles,
  },
  {
    label: 'Chuẩn định dạng',
    value: 'PDF, DOCX, MP4',
    detail: 'Hỗ trợ đa phương tiện dung lượng lớn',
    icon: CheckCircle2,
  },
];

export default function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to={APP_PATHS.DASHBOARD} replace />;
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. Welcome Hero Banner */}
      <section
        aria-label="Lời chào mừng và tổng quan hệ thống"
        className="relative overflow-hidden rounded-2xl border border-border-subtle bg-surface p-6 sm:p-8 shadow-xs"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex items-center gap-2.5 flex-wrap">
              <Badge variant="success" className="select-none">
                <span className="h-1.5 w-1.5 rounded-full bg-success mr-1.5 animate-pulse" />
                Hệ thống hoạt động bình thường
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-main">
              Cổng Quản lý Tài nguyên Học liệu Số
            </h1>
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
              Hệ thống lưu trữ, kiểm duyệt tài liệu học tập, phát hiện đạo văn bằng AI và xử lý khiếu nại bản quyền dành
              cho cán bộ, giảng viên và sinh viên Trường Đại học Quy Nhơn.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link to={APP_PATHS.RESOURCE_UPLOAD} className={buttonVariants({ variant: 'primary', size: 'md' })}>
              <Plus className="size-4 mr-1.5" />
              Tải lên tài nguyên
            </Link>
            <Link to={APP_PATHS.RESOURCES_MANAGER} className={buttonVariants({ variant: 'outline', size: 'md' })}>
              <Files className="size-4 mr-1.5" />
              Quản lý tài liệu
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Quick Access Feature Grid */}
      <section aria-label="Lối tắt tính năng chính" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-text-main">Tính năng & Điều hướng nhanh</h2>
            <p className="text-xs sm:text-sm text-text-muted">
              Truy cập nhanh vào các phân hệ chính của nền tảng quản lý tài nguyên.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {QUICK_ACTIONS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.title}
                to={item.href}
                className="group flex flex-col justify-between rounded-xl border border-border-subtle bg-surface p-5 transition-all duration-200 hover:border-primary/40 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 select-none cursor-pointer"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`flex size-10 items-center justify-center rounded-lg ${item.iconBg}`}>
                      <Icon className="size-5" aria-hidden="true" />
                    </div>
                    <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                      {item.tag}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-text-main group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-xs text-text-muted leading-relaxed line-clamp-2">{item.description}</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border-subtle/60 flex items-center justify-between text-xs font-medium text-primary">
                  <span>Mở phân hệ</span>
                  <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3. Platform Metric Highlights */}
      <section aria-label="Chỉ số hệ thống" className="space-y-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-text-main">Chỉ số nền tảng</h2>
          <p className="text-xs sm:text-sm text-text-muted">
            Tổng quan tiêu chuẩn chất lượng và lưu trữ dữ liệu học liệu của trường.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PLATFORM_METRICS.map((metric) => {
            const Icon = metric.icon;
            return (
              <div
                key={metric.label}
                className="rounded-xl border border-border-subtle bg-surface p-4 shadow-xs flex flex-col justify-between select-none"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-text-muted">{metric.label}</span>
                  <div className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Icon className="size-3.5" aria-hidden="true" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-bold tracking-tight text-text-main">{metric.value}</div>
                  <div className="text-[11px] text-text-muted mt-0.5">{metric.detail}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Guidelines and Policy Box */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ShieldCheck className="size-4" />
            </div>
            <div>
              <CardTitle className="text-base font-bold">Quy chuẩn tải lên & Kiểm duyệt học liệu</CardTitle>
              <CardDescription className="text-xs">
                Vui lòng tuân thủ các quy định dưới đây để đảm bảo tài liệu được duyệt nhanh chóng.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-xs text-text-muted leading-relaxed">
          <p className="flex items-start gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
            <span>
              <strong className="text-text-main font-semibold">Quyền tác giả:</strong> Đảm bảo bạn là tác giả hoặc có
              quyền chia sẻ tài liệu học tập theo quy chế sở hữu trí tuệ của nhà trường.
            </span>
          </p>
          <p className="flex items-start gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
            <span>
              <strong className="text-text-main font-semibold">Tỷ lệ tương đồng AI:</strong> Mọi tài liệu nghiên cứu/báo
              cáo sẽ được quét tự động qua mô hình kiểm tra đạo văn. Tỷ lệ tương đồng khuyến nghị dưới 20%.
            </span>
          </p>
          <p className="flex items-start gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
            <span>
              <strong className="text-text-main font-semibold">Quy trình khiếu nại:</strong> Trong trường hợp tài liệu
              bị từ chối hoặc có phản ánh sai lệch, bạn có thể nộp đơn khiếu nại trực tiếp tại phân hệ Khiếu nại.
            </span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
