/* eslint-disable react-refresh/only-export-components */
import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import { ROUTE_SEGMENTS } from '@/constants/path';
import searchLoader from '@/features/resources/pages/searchLoader';

// const SearchHubPage = lazy(() => import('@/features/dashboard/pages/SearchHubPage'));
const PlaceholderFeaturePage = lazy(() => import('@/features/dashboard/pages/PlaceholderFeaturePage'));

export const searchRoutes: RouteObject[] = [
  {
    path: ROUTE_SEGMENTS.SEARCH,
    // element: <SearchHubPage />,
    lazy: async () => {
      const { SearchHubPage } = await import('@/features/dashboard/pages/SearchHubPage');
      return { Component: SearchHubPage };
    },
    handle: {
      meta: {
        title: 'Tra cứu tài nguyên',
        breadcrumb: 'Tra cứu',
      },
    },
    loader: searchLoader,
  },
  {
    path: ROUTE_SEGMENTS.RESOURCES,
    // element: <SearchHubPage />,
    lazy: async () => {
      const { SearchHubPage } = await import('@/features/dashboard/pages/SearchHubPage');
      return { Component: SearchHubPage };
    },
    handle: {
      meta: {
        title: 'Tất cả tài nguyên',
        breadcrumb: 'Tất cả tài nguyên',
      },
    },
    loader: searchLoader,
  },
  {
    path: ROUTE_SEGMENTS.LECTURES,
    element: (
      <PlaceholderFeaturePage
        title="Tài liệu Bài giảng & Giáo trình"
        description="Danh mục giáo trình, bài giảng và tài liệu học tập của các bộ môn."
      />
    ),
    handle: {
      meta: {
        title: 'Bài giảng',
        breadcrumb: 'Bài giảng',
      },
    },
  },
  {
    path: ROUTE_SEGMENTS.THESES,
    element: (
      <PlaceholderFeaturePage
        title="Khóa luận tốt nghiệp"
        description="Kho lưu trữ các đề tài khóa luận và đồ án tốt nghiệp xuất sắc của sinh viên."
      />
    ),
    handle: {
      meta: {
        title: 'Khóa luận tốt nghiệp',
        breadcrumb: 'Khóa luận',
      },
    },
  },
  {
    path: ROUTE_SEGMENTS.COURSE_REPORTS,
    element: (
      <PlaceholderFeaturePage
        title="Báo cáo môn học & Đồ án"
        description="Tổng hợp báo cáo bài tập lớn, đồ án môn học và nghiên cứu khoa học sinh viên."
      />
    ),
    handle: {
      meta: {
        title: 'Báo cáo môn học',
        breadcrumb: 'Báo cáo môn học',
      },
    },
  },
  {
    path: ROUTE_SEGMENTS.SOURCE_CODE,
    element: (
      <PlaceholderFeaturePage
        title="Kho Mã nguồn & Dự án mẫu"
        description="Lưu trữ tài nguyên mã nguồn lập trình, dự án mẫu và thư viện dùng chung."
      />
    ),
    handle: {
      meta: {
        title: 'Mã nguồn',
        breadcrumb: 'Mã nguồn',
      },
    },
  },
  {
    path: ROUTE_SEGMENTS.OTHER_RESOURCES,
    element: (
      <PlaceholderFeaturePage
        title="Tài nguyên & Tài liệu khác"
        description="Các tài liệu tham khảo bổ trợ, biểu mẫu và quy chế học liệu của nhà trường."
      />
    ),
    handle: {
      meta: {
        title: 'Tài nguyên khác',
        breadcrumb: 'Tài nguyên khác',
      },
    },
  },
];

export default searchRoutes;
