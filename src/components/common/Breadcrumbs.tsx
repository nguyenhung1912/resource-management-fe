import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useBreadcrumbs } from '@/routes/hooks/useBreadcrumbs';
import { cn } from '@/utils/cn';

interface BreadcrumbsProps {
  className?: string;
}

export function Breadcrumbs({ className }: BreadcrumbsProps) {
  const items = useBreadcrumbs();

  if (items.length <= 1) {
    return null;
  }

  return (
    <nav aria-label="Đường dẫn phân cấp" className={cn('flex items-center', className)}>
      <ol className="flex items-center gap-1.5 text-xs text-text-muted">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={item.path} className="flex items-center gap-1.5">
              {index > 0 ? (
                <ChevronRight className="h-3.5 w-3.5 text-text-muted/60 shrink-0" aria-hidden="true" />
              ) : null}
              {isLast ? (
                <span className="font-semibold text-text-main" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.path}
                  className="hover:text-text-main transition-colors outline-none focus-visible:underline rounded-xs"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Breadcrumbs;
