import axiosClient from '@/services/axiosClient';
import type { SearchRequestParams, SearchResponse } from '@/features/resources/types/search.types';

function cleanParams(params: Partial<SearchRequestParams>): Record<string, unknown> {
  const out: Record<string, unknown> = {};

  Object.entries(params).forEach(([key, value]) => {
    // Lọc bỏ các giá trị rỗng hoặc không xác định để URL không bị rác
    if (value === undefined || value === null) return;
    if (typeof value === 'string' && value.trim() === '') return;
    out[key] = value;
  });

  return out;
}

export async function searchResources(params: SearchRequestParams): Promise<SearchResponse> {
  const withDefaults: SearchRequestParams = {
    page: 1,
    pageSize: 10,
    ...params,
  };

  const cleaned = cleanParams(withDefaults);

  const response = await axiosClient.get<SearchResponse>('/api/Search', {
    params: cleaned,
  });

  return response.data;
}

export default { searchResources };
