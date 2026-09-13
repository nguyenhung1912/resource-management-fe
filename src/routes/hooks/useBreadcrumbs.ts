import { useMatches } from 'react-router-dom';
import type { RouteHandle } from '../types';

export interface BreadcrumbItem {
  label: string;
  path: string;
  isCurrent: boolean;
}

export function useBreadcrumbs(): BreadcrumbItem[] {
  const matches = useMatches();

  const breadcrumbs: BreadcrumbItem[] = [];
  const validMatches = matches.filter((m) => (m.handle as RouteHandle | undefined)?.meta?.breadcrumb);

  validMatches.forEach((match, index) => {
    const meta = (match.handle as RouteHandle | undefined)?.meta;
    if (meta?.breadcrumb) {
      breadcrumbs.push({
        label: meta.breadcrumb,
        path: match.pathname,
        isCurrent: index === validMatches.length - 1,
      });
    }
  });

  return breadcrumbs;
}

export default useBreadcrumbs;
