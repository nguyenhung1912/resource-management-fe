import type { LucideIcon } from 'lucide-react';
import { ArrowLeft, Home, RefreshCw } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
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
    icon: 'border-error-yellow/40 bg-error-yellow/20 text-error-navy',
    code: 'text-error-navy',
    action:
      'bg-error-yellow text-error-navy hover:bg-error-yellow/80 hover:opacity-100 active:bg-error-yellow/70 focus-visible:ring-error-yellow/40',
  },
  danger: {
    icon: 'border-error-red/20 bg-error-red/10 text-error-red',
    code: 'text-error-red',
    action:
      'bg-error-red text-error-white hover:bg-error-red/90 hover:opacity-100 active:bg-error-red/80 focus-visible:ring-error-red/40',
  },
} as const;

export function ErrorStatePage({ code, title, description, icon: Icon, primaryAction, tone }: ErrorStatePageProps) {
  const navigate = useNavigate();
  const titleId = `error-${code}-title`;
  const styles = toneStyles[tone];

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
      className="min-h-[calc(100vh-129px)] bg-error-gray/20 px-4 py-12 sm:px-6 flex items-center justify-center"
    >
      <div className="w-full max-w-2xl rounded-xl border border-error-gray bg-error-white px-6 py-10 text-center shadow-xs sm:px-12 sm:py-14">
        <div
          className={cn(
            'mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-xl border sm:h-20 sm:w-20',
            styles.icon,
          )}
        >
          <Icon aria-hidden="true" className="h-8 w-8 sm:h-10 sm:w-10" strokeWidth={1.75} />
        </div>

        <p className={cn('mb-3 font-mono text-sm font-semibold tracking-[0.2em]', styles.code)}>LỖI {code}</p>
        <h1 id={titleId} className="text-2xl font-bold tracking-tight text-error-navy sm:text-3xl">
          {title}
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-error-navy/70 sm:text-base">{description}</p>

        <div className="mt-8 flex flex-col-reverse justify-center gap-3 sm:flex-row">
          <Link
            to={APP_PATHS.HOME}
            className={cn(
              buttonVariants({ variant: 'secondary', size: 'md' }),
              'w-full border-error-gray bg-error-white text-error-navy hover:bg-error-gray/20 active:bg-error-gray/40 focus-visible:ring-error-blue/40 sm:w-auto',
            )}
          >
            <Home aria-hidden="true" className="h-4 w-4" />
            Về trang chủ
          </Link>

          {primaryAction === 'login' ? (
            <Link
              to={APP_PATHS.LOGIN}
              className={cn(buttonVariants({ variant: 'primary', size: 'md' }), 'w-full sm:w-auto', styles.action)}
            >
              Đăng nhập
            </Link>
          ) : (
            <Button
              variant="primary"
              className={cn('w-full sm:w-auto', styles.action)}
              iconLeft={<ActionIcon aria-hidden="true" className="h-4 w-4" />}
              onClick={handlePrimaryAction}
            >
              {primaryActionLabels[primaryAction]}
            </Button>
          )}
        </div>

        <p className="mt-8 text-xs text-error-navy/60">
          Nếu sự cố vẫn tiếp diễn, vui lòng liên hệ quản trị viên hệ thống.
        </p>
      </div>
    </section>
  );
}
