import type { LucideIcon } from 'lucide-react';
import { ArrowLeft, HelpCircle, Home, RefreshCw } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/Badge';
import { Button, buttonVariants } from '@/components/ui/Button';
import { APP_PATHS } from '@/constants/path';
import { cn } from '@/utils/cn';

export interface ErrorStatePageProps {
  code: string;
  title: string;
  description: string;
  suggestion?: string;
  icon: LucideIcon;
  primaryAction: 'back' | 'login' | 'retry';
  tone?: 'primary' | 'warning' | 'danger';
}

const primaryActionLabels = {
  back: 'Quay lại',
  login: 'Đăng nhập',
  retry: 'Thử lại',
} as const;

const toneStyles = {
  primary: {
    iconWrapper: 'bg-primary/10 text-primary border-primary/25 ring-primary/10',
    topBar: 'from-transparent via-primary to-transparent',
    watermark: 'text-primary/5',
    ambientGlow: 'bg-primary/10',
    badgeVariant: 'primary' as const,
    primaryButtonVariant: 'primary' as const,
  },
  warning: {
    iconWrapper: 'bg-amber-50 text-warning border-amber-200/80 ring-amber-100/60',
    topBar: 'from-transparent via-warning to-transparent',
    watermark: 'text-warning/5',
    ambientGlow: 'bg-warning/10',
    badgeVariant: 'warning' as const,
    primaryButtonVariant: 'primary' as const,
  },
  danger: {
    iconWrapper: 'bg-badge-danger-bg text-danger border-rose-200/80 ring-rose-100/60',
    topBar: 'from-transparent via-danger to-transparent',
    watermark: 'text-danger/5',
    ambientGlow: 'bg-danger/10',
    badgeVariant: 'danger' as const,
    primaryButtonVariant: 'danger' as const,
  },
} as const;

export function ErrorStatePage({
  code,
  title,
  description,
  suggestion,
  icon: Icon,
  primaryAction,
  tone = 'primary',
}: ErrorStatePageProps) {
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
      className="relative flex min-h-[calc(100vh-10rem)] w-full items-center justify-center px-4 py-12 sm:px-6 overflow-hidden select-none"
    >
      {/* Ambient background light glow */}
      <div
        className={cn(
          'pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 size-96 rounded-full blur-3xl -z-10',
          styles.ambientGlow,
        )}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-border-subtle bg-surface/95 backdrop-blur-sm p-7 sm:p-10 text-center shadow-lg transition-all">
        {/* Top accent gradient bar */}
        <div className={cn('absolute inset-x-0 top-0 h-1 bg-gradient-to-r', styles.topBar)} aria-hidden="true" />

        {/* Large stylized watermark number */}
        <div
          className={cn(
            'pointer-events-none absolute -right-4 -top-6 select-none font-mono text-8xl sm:text-9xl font-black tracking-tighter opacity-80',
            styles.watermark,
          )}
          aria-hidden="true"
        >
          {code}
        </div>

        {/* Floating icon */}
        <div className="relative mb-5 flex justify-center">
          <div
            className={cn(
              'flex size-18 sm:size-20 items-center justify-center rounded-2xl border ring-8 shadow-xs transition-transform duration-300 hover:scale-105 select-none',
              styles.iconWrapper,
            )}
          >
            <Icon aria-hidden="true" className="size-9 sm:size-10" strokeWidth={1.8} />
          </div>
        </div>

        {/* Status Badge */}
        <div className="mb-3 flex justify-center">
          <Badge
            variant={styles.badgeVariant}
            showDot
            className="px-3 py-1 font-semibold text-xs tracking-wider uppercase"
          >
            LỖI {code}
          </Badge>
        </div>

        {/* Title & Description */}
        <h1 id={titleId} className="text-2xl sm:text-3xl font-bold tracking-tight text-text-main">
          {title}
        </h1>
        <p className="mx-auto mt-2.5 max-w-md text-xs sm:text-sm leading-relaxed text-text-muted">{description}</p>

        {/* Helpful Suggestion Box */}
        {suggestion ? (
          <div className="mx-auto mt-6 flex items-start gap-2.5 rounded-xl border border-border-subtle bg-background/80 p-3.5 text-left text-xs text-text-muted">
            <HelpCircle className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
            <p className="leading-relaxed">
              <span className="font-semibold text-text-main">Gợi ý: </span>
              {suggestion}
            </p>
          </div>
        ) : null}

        {/* Action buttons */}
        <div className="mt-8 flex flex-col-reverse justify-center gap-3 sm:flex-row">
          <Link
            to={APP_PATHS.HOME}
            className={cn(
              buttonVariants({
                variant: primaryAction === 'back' ? 'primary' : 'secondary',
                size: 'md',
              }),
              'w-full sm:w-auto gap-2 shadow-xs cursor-pointer',
            )}
          >
            <Home aria-hidden="true" className="h-4 w-4" />
            Về trang chủ
          </Link>

          {primaryAction === 'login' ? (
            <Link
              to={APP_PATHS.LOGIN}
              className={cn(
                buttonVariants({ variant: styles.primaryButtonVariant, size: 'md' }),
                'w-full sm:w-auto shadow-xs cursor-pointer',
              )}
            >
              Đăng nhập
            </Link>
          ) : (
            <Button
              variant={primaryAction === 'back' ? 'secondary' : styles.primaryButtonVariant}
              size="md"
              className="w-full sm:w-auto shadow-xs cursor-pointer"
              iconLeft={<ActionIcon aria-hidden="true" className="h-4 w-4" />}
              onClick={handlePrimaryAction}
            >
              {primaryActionLabels[primaryAction]}
            </Button>
          )}
        </div>

        {/* System footer note */}
        <p className="mt-7 text-[11px] text-text-muted">
          Nếu sự cố vẫn tiếp diễn, vui lòng liên hệ quản trị viên hệ thống để được hỗ trợ.
        </p>
      </div>
    </section>
  );
}

export default ErrorStatePage;
