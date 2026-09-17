import { Pagination, type PaginationProps } from '@/components/common/Pagination';

export type AppealPaginationProps = PaginationProps;

export function AppealPagination(props: AppealPaginationProps) {
  return <Pagination itemLabel="khiếu nại" {...props} />;
}

export default AppealPagination;
