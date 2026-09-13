import type { LucideIcon } from 'lucide-react';
import { ArrowLeft, Home, RefreshCw } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/Badge';
import { Button, buttonVariants } from '@/components/ui/Button';
import { APP_PATHS } from '@/constants/path';
import { cn } from '@/utils/cn';

interface ErrorStatePageProps {
  code: string;
  title: string;
  description: string;
  icon: LucideIcon;
  primaryAction: 'back' | 'login' | 'retry';
  tone: 'warning' | 'danger';
}

const primaryActionLabels = {
  back: 'Quay lại',
  login: 'Đăng nhập',
  retry: 'Thử lại',
} as const;

const toneStyles = {
  warning: {
    icon: 'border-orange-200/70 bg-orange-50 text-warning',
  },
  danger: {
    icon: 'border-rose-200/70 bg-badge-danger-bg text-danger',
  },
} as const;

export function ErrorStatePage({ code, title, description, icon: Icon, primaryAction, tone }: ErrorStatePageProps) {
  const navigate = useNavigate();
  const titleId = `error-${code}-title`;
  const styles = toneStyles[tone];
  const primaryVariant = tone === 'danger' ? 'danger' : 'primary';

  const handlePrimaryAction = () => {
    if (primaryAction === 'back') {
      navigate(-1);
      return;
    }

    if (primaryAction === 'retry') {
      navigate(0);
    }
  };

  const ActionIcon = primaryAction === 'retry' ? RefreshCw : ArrowLeft;

  return (
    <section
      aria-labelledby={titleId}
      className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6"
    >
      <div className="w-full max-w-2xl rounded-xl border border-border-subtle bg-surface px-6 py-10 text-center shadow-xs sm:px-12 sm:py-14">
        <div
          className={cn(
            'mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-xl border sm:h-20 sm:w-20',
            styles.icon,
          )}
        >
          <Icon aria-hidden="true" className="h-8 w-8 sm:h-10 sm:w-10" strokeWidth={1.75} />
        </div>

        <div className="mb-3 flex justify-center">
          <Badge variant={tone === 'danger' ? 'danger' : 'warning'} showDot>
            LỖI {code}
          </Badge>
        </div>
        <h1 id={titleId} className="text-2xl font-bold tracking-tight text-text-main sm:text-3xl">
          {title}
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-text-muted sm:text-base">{description}</p>

        <div className="mt-8 flex flex-col-reverse justify-center gap-3 sm:flex-row">
          <Link
            to={APP_PATHS.HOME}
            className={cn(buttonVariants({ variant: 'secondary', size: 'md' }), 'w-full sm:w-auto gap-2')}
          >
            <Home aria-hidden="true" className="h-4 w-4" />
            Về trang chủ
          </Link>

          {primaryAction === 'login' ? (
            <Link
              to={APP_PATHS.LOGIN}
              className={cn(buttonVariants({ variant: primaryVariant, size: 'md' }), 'w-full sm:w-auto')}
            >
              Đăng nhập
            </Link>
          ) : (
            <Button
              variant={primaryVariant}
              size="md"
              className="w-full sm:w-auto"
              iconLeft={<ActionIcon aria-hidden="true" className="h-4 w-4" />}
              onClick={handlePrimaryAction}
            >
              {primaryActionLabels[primaryAction]}
            </Button>
          )}
        </div>

        <p className="mt-8 text-xs text-text-muted">
          Nếu sự cố vẫn tiếp diễn, vui lòng liên hệ quản trị viên hệ thống.
        </p>
      </div>
    </section>
  );
}
