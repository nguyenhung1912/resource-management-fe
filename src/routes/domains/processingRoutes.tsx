/* eslint-disable react-refresh/only-export-components */
import { lazy, Suspense } from 'react';
import type { RouteObject } from 'react-router-dom';
import { ROUTE_PARAMS, ROUTE_SEGMENTS } from '@/constants/path';
import { PageLoadingState } from '@/components/common/PageLoadingState';
import { processingJobLoader } from '@/features/processing/pages/processingJobLoader';
import { processingResourceLoader } from '@/features/processing/pages/processingResourceLoader';

const JobPage = lazy(() => import('@/features/processing/pages/ProcessingJobPage'));
const ResourcePage = lazy(() => import('@/features/processing/pages/ProcessingResourcePage'));
const ErrorPage = lazy(() =>
  import('@/features/errors/pages/ErrorPages').then((m) => ({ default: m.ServerErrorPage })),
);
export const processingRoutes: RouteObject[] = [
  {
    path: `${ROUTE_SEGMENTS.PROCESSING_JOBS}/${ROUTE_PARAMS.JOB_ID}`,
    element: (
      <Suspense fallback={<PageLoadingState />}>
        <JobPage />
      </Suspense>
    ),
    loader: processingJobLoader,
    errorElement: (
      <Suspense fallback={<PageLoadingState />}>
        <ErrorPage />
      </Suspense>
    ),
    handle: { meta: { title: 'Xử lý tài liệu', breadcrumb: 'Xử lý' } },
  },
  {
    path: `${ROUTE_SEGMENTS.PROCESSING_RESOURCES}/${ROUTE_PARAMS.FILE_ID}`,
    element: (
      <Suspense fallback={<PageLoadingState />}>
        <ResourcePage />
      </Suspense>
    ),
    loader: processingResourceLoader,
    errorElement: (
      <Suspense fallback={<PageLoadingState />}>
        <ErrorPage />
      </Suspense>
    ),
    handle: { meta: { title: 'Báo cáo tài liệu', breadcrumb: 'Báo cáo' } },
  },
];
