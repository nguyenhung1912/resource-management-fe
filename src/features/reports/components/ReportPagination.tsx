import { Pagination } from '@/components/common/Pagination';
import type { PaginationProps } from '@/components/common/Pagination';

export type ReportPaginationProps = PaginationProps;

export function ReportPagination(props: ReportPaginationProps) {
  return <Pagination itemLabel="báo cáo" {...props} />;
}

export default ReportPagination;
