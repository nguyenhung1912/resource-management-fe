import { Code2, Plus, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/Badge';
import { Button, buttonVariants } from '@/components/ui/Button';
import { PageHeader } from '@/components/common/PageHeader';
import { APP_PATHS } from '@/constants/path';

export interface SourceCodeHeaderProps {
  onRefresh?: () => void;
  onUploadClick?: () => void;
}

export function SourceCodeHeader({ onRefresh, onUploadClick }: SourceCodeHeaderProps) {
  return (
    <PageHeader
      title="Kho Mã nguồn & Dự án mẫu"
      description="Khám phá, tra cứu các dự án phần mềm, repository GitHub và mã nguồn tham khảo của sinh viên và giảng viên."
      icon={Code2}
      iconBg="bg-primary/10 text-primary"
      badge={
        <Badge variant="primary" showDot={false} className="font-semibold tracking-wide">
          Học liệu Lập trình
        </Badge>
      }
      actions={
        <div className="flex items-center gap-2.5">
          {onRefresh && (
            <Button type="button" variant="outline" size="md" onClick={onRefresh} aria-label="Làm mới danh sách">
              <RotateCcw className="size-4 mr-1.5" aria-hidden="true" />
              Làm mới
            </Button>
          )}

          {onUploadClick ? (
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={onUploadClick}
              aria-label="Đăng tải mã nguồn mới"
            >
              <Plus className="size-4 mr-1.5" aria-hidden="true" />
              Đăng tải mã nguồn
            </Button>
          ) : (
            <Link
              to={APP_PATHS.RESOURCE_UPLOAD}
              className={buttonVariants({ variant: 'primary', size: 'md' })}
              aria-label="Đăng tải mã nguồn mới"
            >
              <Plus className="size-4 mr-1.5" aria-hidden="true" />
              Đăng tải mã nguồn
            </Link>
          )}
        </div>
      }
    />
  );
}

export default SourceCodeHeader;
