import { Link } from 'react-router-dom';
import { ArrowRight, Files, Search, ShieldCheck, Sparkles, Upload } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { APP_PATHS } from '@/constants/path';
import { cn } from '@/utils/cn';

export interface HomeQuickActionsProps {
  className?: string;
}

const CORE_ACTION_ITEMS = [
  {
    title: 'Đăng tải Tài nguyên mới',
    description: 'Đăng tải giáo trình, đề cương, bài giảng hoặc tài liệu học tập vào kho lưu trữ.',
    href: APP_PATHS.RESOURCE_UPLOAD,
    icon: Upload,
    iconBg: 'bg-emerald-50 text-success',
    badge: 'Tải lên',
  },
  {
    title: 'Quản lý Tài liệu',
    description: 'Theo dõi tiến trình kiểm duyệt, tìm kiếm và chỉnh sửa các tài liệu đã tải lên hệ thống.',
    href: APP_PATHS.RESOURCES_MANAGER,
    icon: Files,
    iconBg: 'bg-primary/10 text-primary',
    badge: 'Quản trị',
  },
  {
    title: 'Tra cứu Học liệu',
    description: 'Tìm kiếm toàn diện tài liệu theo chuyên ngành, học phần, tác giả và năm hoàn thành.',
    href: APP_PATHS.SEARCH,
    icon: Search,
    iconBg: 'bg-sky-50 text-sky-600',
    badge: 'Tra cứu',
  },
  {
    title: 'Kiểm tra Đạo văn AI',
    description: 'Phân tích tỷ lệ tương đồng văn bản, phát hiện trùng lặp tự động bằng trí tuệ nhân tạo.',
    href: APP_PATHS.PLAGIARISM_REPORTS,
    icon: Sparkles,
    iconBg: 'bg-purple-50 text-purple-600',
    badge: 'AI Scan',
  },
] as const;

export function HomeQuickActions({ className }: HomeQuickActionsProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {/* 1. Quick Action Shortcuts */}
      <section aria-label="Lối tắt tính năng cốt lõi" className="space-y-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-text-main">Tính năng & Điều hướng nhanh</h2>
          <p className="text-xs sm:text-sm text-text-muted">
            Truy cập nhanh vào các phân hệ chính của nền tảng quản lý tài nguyên học thuật.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CORE_ACTION_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.title}
                to={item.href}
                className="group flex flex-col justify-between rounded-xl border border-border-subtle bg-surface p-4.5 transition-all duration-200 hover:border-primary/40 hover:shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 select-none cursor-pointer"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className={`flex size-9 items-center justify-center rounded-lg ${item.iconBg}`}>
                      <Icon className="size-4.5" aria-hidden="true" />
                    </div>
                    <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                      {item.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-semibold text-xs sm:text-sm text-text-main group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-xs text-text-muted leading-relaxed line-clamp-2">{item.description}</p>
                  </div>
                </div>

                <div className="mt-3.5 pt-2.5 border-t border-border-subtle/60 flex items-center justify-between text-xs font-medium text-primary">
                  <span>Truy cập</span>
                  <ArrowRight
                    className="size-3.5 transition-transform duration-200 group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 2. Institutional Standards & Policies */}
      <Card className="rounded-xl border border-border-subtle bg-surface shadow-2xs">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
              <ShieldCheck className="size-4" aria-hidden="true" />
            </div>
            <div>
              <CardTitle className="text-sm sm:text-base font-bold text-text-main">
                Quy chuẩn tải lên & Kiểm duyệt học liệu
              </CardTitle>
              <CardDescription className="text-xs text-text-muted">
                Tuân thủ quy chế quản lý học liệu và sở hữu trí tuệ Trường Đại học Quy Nhơn
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-2 text-xs text-text-muted leading-relaxed pt-0">
          <div className="flex items-start gap-2">
            <span className="size-1.5 rounded-full bg-primary mt-1.5 shrink-0" aria-hidden="true" />
            <span>
              <strong className="text-text-main font-semibold">Quyền tác giả:</strong> Đảm bảo bạn là tác giả hoặc có
              quyền chia sẻ tài liệu học tập theo quy chế sở hữu trí tuệ của nhà trường.
            </span>
          </div>

          <div className="flex items-start gap-2">
            <span className="size-1.5 rounded-full bg-primary mt-1.5 shrink-0" aria-hidden="true" />
            <span>
              <strong className="text-text-main font-semibold">Tỷ lệ tương đồng AI:</strong> Mọi tài liệu học liệu số
              tải lên sẽ được quét tự động qua mô hình kiểm tra đạo văn. Tỷ lệ tương đồng khuyến nghị dưới 20%.
            </span>
          </div>

          <div className="flex items-start gap-2">
            <span className="size-1.5 rounded-full bg-primary mt-1.5 shrink-0" aria-hidden="true" />
            <span>
              <strong className="text-text-main font-semibold">Quy trình khiếu nại:</strong> Trong trường hợp tài liệu
              bị từ chối hoặc có phản ánh sai lệch, bạn có thể nộp đơn khiếu nại trực tiếp tại phân hệ Khiếu nại.
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default HomeQuickActions;
