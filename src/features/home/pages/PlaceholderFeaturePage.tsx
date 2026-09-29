import { Construction, ArrowLeft, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { buttonVariants } from '@/components/ui/Button';
import { PageHeader } from '@/components/common/PageHeader';
import { APP_PATHS } from '@/constants/path';

export interface PlaceholderFeaturePageProps {
  title?: string;
  description?: string;
  icon?: LucideIcon;
}

export function PlaceholderFeaturePage({
  title = 'Phân hệ chức năng',
  description = 'Tính năng đang trong lộ trình phát triển và hoàn thiện giao diện.',
  icon: Icon = Layers,
}: PlaceholderFeaturePageProps) {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <PageHeader
        title={title}
        description={description}
        icon={Icon}
        badge={
          <Badge variant="warning" showDot>
            Đang phát triển
          </Badge>
        }
        actions={
          <Link to={APP_PATHS.RESOURCES_MANAGER} className={buttonVariants({ variant: 'outline', size: 'md' })}>
            <ArrowLeft className="size-4 mr-1.5" aria-hidden="true" />
            Về bảng điều khiển
          </Link>
        }
      />

      <div className="rounded-2xl border border-dashed border-border-subtle bg-surface p-12 text-center shadow-2xs space-y-4">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600">
          <Construction className="size-7" aria-hidden="true" />
        </div>

        <div className="max-w-md mx-auto space-y-2">
          <h2 className="text-base font-bold text-text-main">Phân hệ đang được hoàn thiện</h2>
          <p className="text-xs text-text-muted leading-relaxed">
            Dữ liệu và các công cụ nghiệp vụ của phân hệ này đang được cấu hình đồng bộ với máy chủ. Bạn có thể quay lại
            quản lý tài nguyên hoặc tra cứu tài liệu học tập.
          </p>
        </div>

        <div className="pt-2">
          <Link to={APP_PATHS.SEARCH} className={buttonVariants({ variant: 'primary', size: 'sm' })}>
            Mở Trung tâm Tra cứu
          </Link>
        </div>
      </div>
    </div>
  );
}

export default PlaceholderFeaturePage;
