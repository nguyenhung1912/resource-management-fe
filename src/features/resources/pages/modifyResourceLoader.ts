import type { LoaderFunctionArgs } from 'react-router-dom';
import { resourceService } from '@/services/resourceService';
import {
  initialUploadResourceCatalogData,
  uploadResourceLoader,
  type UploadResourceLoaderData,
} from './uploadResourceLoader';
import type { ModifyResourceInitialValues, ResourceDetailResponse } from '@/features/resources/types/resource.types';

export interface ModifyResourceLoaderData {
  resource: ModifyResourceInitialValues;
  catalog: UploadResourceLoaderData;
}

export function createFallbackResource(resourceId: string): ModifyResourceInitialValues {
  return {
    id: resourceId,
    documentFileName: 'Báo cáo thực tập_Final.pdf',
    documentFileTypeName: 'PDF',
    documentFileSizeBytes: 2_516_582,
    fileName: 'Báo cáo thực tập',
    fileDescription: 'Báo cáo tổng kết quá trình thực tập doanh nghiệp.',
    fileTypeId: 1,
    subMajorCode: 'SE',
    courseCode: 'SWR302',
    yearCompleted: 2024,
    authorNames: ['Nguyễn Văn A'],
    keywords: ['thực tập', 'báo cáo'],
  };
}

export function mapDetailToInitialValues(
  resourceId: string,
  detail: ResourceDetailResponse | null | undefined,
): ModifyResourceInitialValues {
  if (!detail) {
    return createFallbackResource(resourceId);
  }

  const documentFileName =
    detail.fileName?.trim() || (detail.fileUrl ? detail.fileUrl.split('/').pop() || 'Tài liệu' : 'Tài liệu');

  let authorNames: string[] = [];
  if (Array.isArray(detail.authorNames) && detail.authorNames.length > 0) {
    authorNames = detail.authorNames.map((name) => name.trim()).filter(Boolean);
  } else if (Array.isArray(detail.authors) && detail.authors.length > 0) {
    authorNames = detail.authors.map((a) => (a.authorName || a.fullName || '').trim()).filter(Boolean);
  }

  let keywords: string[] = [];
  if (Array.isArray(detail.keywords)) {
    keywords = detail.keywords.map((k) => (typeof k === 'string' ? k.trim() : '')).filter(Boolean);
  }

  return {
    id: detail.fileId || resourceId,
    documentFileName,
    documentFileTypeName: detail.fileTypeName?.trim() || 'Tài liệu',
    documentFileSizeBytes: detail.fileSize ?? null,
    fileName: detail.fileName || '',
    fileDescription: detail.fileDescription ?? null,
    fileTypeId: detail.fileTypeId || 1,
    subMajorCode: detail.subMajorCode || '',
    courseCode: detail.courseCode || null,
    yearCompleted: detail.yearCompleted ?? null,
    authorNames,
    keywords,
  };
}

export async function modifyResourceLoader({ params }: LoaderFunctionArgs): Promise<ModifyResourceLoaderData> {
  const resourceId = params.resourceId || 'resource-1';

  try {
    const [detailRes, catalog] = await Promise.all([
      resourceService.getResourceDetail<ResourceDetailResponse>(resourceId).catch(() => null),
      uploadResourceLoader().catch(() => initialUploadResourceCatalogData),
    ]);

    return {
      resource: mapDetailToInitialValues(resourceId, detailRes),
      catalog,
    };
  } catch {
    return {
      resource: createFallbackResource(resourceId),
      catalog: initialUploadResourceCatalogData,
    };
  }
}

export default modifyResourceLoader;
