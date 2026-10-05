import type { LoaderFunctionArgs } from 'react-router-dom';
import { auditLogService } from '@/services/auditLogService';
import type { AuditLogQueryParams, PagedAuditLogResponse } from '../types/audit-log.types';

export interface AuditLogsLoaderData {
  logs: PagedAuditLogResponse;
  query: AuditLogQueryParams;
}

export async function auditLogsLoader({ request }: LoaderFunctionArgs): Promise<AuditLogsLoaderData> {
  const url = new URL(request.url);

  const search = url.searchParams.get('search')?.trim() || undefined;
  const action = url.searchParams.get('action')?.trim() || undefined;
  const userId = url.searchParams.get('userId')?.trim() || undefined;
  const username = url.searchParams.get('username')?.trim() || undefined;
  const fromDate = url.searchParams.get('fromDate')?.trim() || undefined;
  const toDate = url.searchParams.get('toDate')?.trim() || undefined;

  const statusParam = url.searchParams.get('status');
  const status =
    statusParam !== null && statusParam !== '' && !Number.isNaN(Number(statusParam)) ? Number(statusParam) : undefined;

  const pageParam = url.searchParams.get('pageIndex') ?? url.searchParams.get('pageNumber');
  const pageIndex = Number(pageParam) > 0 ? Number(pageParam) : 1;

  const pageSizeParam = url.searchParams.get('pageSize');
  const pageSize = Number(pageSizeParam) > 0 ? Number(pageSizeParam) : 10;

  const query: AuditLogQueryParams = {
    search,
    action,
    userId,
    username,
    status,
    fromDate,
    toDate,
    pageIndex,
    pageSize,
  };

  const logs = await auditLogService.getAuditLogs(query);

  return {
    logs,
    query,
  };
}
