import { useLoaderData, useNavigate, useParams, useRevalidator } from 'react-router-dom';
import { APP_PATHS } from '@/constants/path';
import { ModifyResourceModal } from '@/features/resources/components/ModifyResourceModal';
import { useModifyResource } from '@/features/resources/hooks/useModifyResource';
import type { ModifyResourceLoaderData } from './modifyResourceLoader';
import { createFallbackResource } from './modifyResourceLoader';
import type { ModifyResourceFormValues, SelectOption } from '@/features/resources/types/resource.types';

const previewFileTypes: SelectOption<number>[] = [
  { value: 1, label: 'Báo cáo nghiên cứu' },
  { value: 2, label: 'Đồ án' },
  { value: 3, label: 'Bài thuyết trình' },
];

const previewSubMajors: SelectOption<string>[] = [
  { value: 'SE', label: 'Kỹ thuật phần mềm' },
  { value: 'AI', label: 'Trí tuệ nhân tạo' },
  { value: 'IS', label: 'Hệ thống thông tin' },
];

const previewCourses: SelectOption<string>[] = [
  { value: 'PRN222', label: 'Lập trình .NET' },
  { value: 'SWR302', label: 'Kiến trúc và thiết kế phần mềm' },
];

export function ModifyResourcePage() {
  const navigate = useNavigate();
  const revalidator = useRevalidator();
  const { resourceId = 'resource-1' } = useParams();
  const loaderData = useLoaderData() as ModifyResourceLoaderData | undefined;
  const { isSubmitting, apiError, modifyResource } = useModifyResource();

  const resource = loaderData?.resource ?? createFallbackResource(resourceId);
  const catalog = loaderData?.catalog;

  const rawFileTypes = catalog?.fileTypes;
  const rawSubMajors = catalog?.subMajors;
  const rawCourses = catalog?.courses;

  const fileTypes: SelectOption<number>[] = rawFileTypes?.length
    ? rawFileTypes.map((ft) => ({
        value: Number(ft.id),
        label: ft.name,
      }))
    : previewFileTypes;

  const subMajors: SelectOption<string>[] = rawSubMajors?.length
    ? rawSubMajors.map((sm) => ({
        value: sm.subMajorCode,
        label: `${sm.subMajorName} (${sm.subMajorCode})`,
      }))
    : previewSubMajors;

  const courses: SelectOption<string>[] = rawCourses?.length
    ? rawCourses.map((c) => ({
        value: c.courseCode,
        label: `${c.courseCode} - ${c.courseName}`,
      }))
    : previewCourses;

  const closeModify = () => {
    void navigate(APP_PATHS.RESOURCES_MANAGER);
  };

  const handleSubmit = async (values: ModifyResourceFormValues) => {
    const targetFileId = resource.id || resourceId;
    const isUpdated = await modifyResource(targetFileId, values);
    if (isUpdated) {
      revalidator.revalidate();
      closeModify();
    }
  };

  return (
    <ModifyResourceModal
      isOpen
      isSubmitting={isSubmitting}
      apiError={apiError}
      resource={resource}
      fileTypes={fileTypes}
      subMajors={subMajors}
      courses={courses}
      onClose={closeModify}
      onSubmit={handleSubmit}
    />
  );
}

export default ModifyResourcePage;
