import { Suspense, type ReactNode } from 'react';
import { PageLoadingState } from '@/components/common/PageLoadingState';

interface RouteSuspenseProps {
  children: ReactNode;
}

export function RouteSuspense({ children }: RouteSuspenseProps) {
  return <Suspense fallback={<PageLoadingState />}>{children}</Suspense>;
}
