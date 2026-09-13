import { lazy, Suspense } from 'react';
import { PageLoadingState } from '@/components/common/PageLoadingState';

const ResourcesManagerPage = lazy(() =>
  import('@/features/resources/pages/ResourcesManagerPage').then((module) => ({
    default: module.ResourcesManagerPage,
  })),
);

const UploadResourcePage = lazy(() =>
  import('@/features/resources/pages/UploadResourcePage').then((module) => ({
    default: module.UploadResourcePage,
  })),
);

export function ResourcesManagerRouteElement() {
  return (
    <Suspense fallback={<PageLoadingState />}>
      <ResourcesManagerPage />
    </Suspense>
  );
}

export function UploadResourceRouteElement() {
  return (
    <Suspense fallback={<PageLoadingState />}>
      <UploadResourcePage />
    </Suspense>
  );
}
