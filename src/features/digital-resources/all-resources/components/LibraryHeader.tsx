import { Library, Plus, RotateCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Button, buttonVariants } from '@/components/ui/Button';
import { APP_PATHS } from '@/constants/path';

export interface LibraryHeaderProps {
  totalCount?: number;
  activeCategoryName?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function LibraryHeader({ totalCount, activeCategoryName, onRefresh, isRefreshing = false }: LibraryHeaderProps) {
  const badgeContent = (
    <div className="flex items-center gap-2">
      <Badge variant="neutral" className="font-medium">
        <span className="size-1.5 rounded-full bg-primary inline-block mr-1.5" />
        {totalCount !== undefined ? `${totalCount.toLocaleString('vi-VN')} tài liệu` : 'Kho học liệu số'}
      </Badge>
      {activeCategoryName && <Badge variant="primary">{activeCategoryName}</Badge>}
    </div>
  );

  const actionsContent = (
    <div className="flex items-center gap-2.5">
      {onRefresh && (
        <Button
          variant="outline"
          size="md"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="gap-2"
          aria-label="Làm mới danh sách tài liệu"
        >
          <RotateCw className={`size-4 ${isRefreshing ? 'animate-spin' : ''}`} aria-hidden="true" />
          <span>Làm mới</span>
        </Button>
      )}

      <Link
        to={APP_PATHS.RESOURCE_UPLOAD}
        className={buttonVariants({ variant: 'primary', size: 'md', className: 'gap-2 shadow-xs' })}
        aria-label="Đăng tải tài nguyên mới"
      >
        <Plus className="size-4" aria-hidden="true" />
        <span>Đăng tải tài nguyên</span>
      </Link>
    </div>
  );

  return (
    <PageHeader
      icon={Library}
      iconBg="bg-primary/10 text-primary"
      title="Thư viện Tài nguyên Số"
      description="Khám phá, tra cứu và tải xuống học liệu, giáo trình, khóa luận, đề tài nghiên cứu khoa học và mã nguồn của nhà trường."
      badge={badgeContent}
      actions={actionsContent}
      ariaLabel="Đầu trang Thư viện Tài nguyên Số"
    />
  );
}

export default LibraryHeader;
