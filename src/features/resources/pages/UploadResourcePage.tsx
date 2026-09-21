import { useLoaderData, useNavigate } from 'react-router-dom';
import { APP_PATHS } from '@/constants/path';
import { UploadResourceModal } from '@/features/resources/components/UploadResourceModal';
import { useUploadResource } from '@/features/resources/hooks/useUploadResource';
import type { UploadResourceLoaderData } from '@/features/resources/pages/uploadResourceLoader';
import type { SelectOption, UploadResourceFormValues } from '@/features/resources/types/resource.types';

// Dữ liệu fallback dự phòng khi chưa tải được loader hoặc môi trường test biệt lập
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

export function UploadResourcePage() {
  const navigate = useNavigate();
  const { isSubmitting, apiError, uploadResource } = useUploadResource();
  const loaderData = useLoaderData() as UploadResourceLoaderData | undefined;

  const closeUpload = () => {
    void navigate(APP_PATHS.RESOURCES_MANAGER);
  };

  const handleSubmit = async (values: UploadResourceFormValues) => {
    const isUploaded = await uploadResource(values);
    if (isUploaded) closeUpload();
  };

  const rawFileTypes = loaderData?.fileTypes;
  const rawDepartments = loaderData?.departments;
  const rawMajors = loaderData?.majors;
  const rawSubMajors = loaderData?.subMajors;
  const rawCourses = loaderData?.courses;

  const fileTypes: SelectOption<number>[] = rawFileTypes?.length
    ? rawFileTypes.map((ft) => ({
        value: Number(ft.id),
        label: ft.name,
      }))
    : previewFileTypes;

  const departments: SelectOption<string>[] = rawDepartments?.length
    ? rawDepartments.map((d) => ({
        value: d.id,
        label: d.name,
      }))
    : [];

  const majors: SelectOption<string>[] = rawMajors?.length
    ? rawMajors.map((m) => ({
        value: m.majorId,
        label: m.majorName,
      }))
    : [];

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

  return (
    <UploadResourceModal
      isOpen
      isSubmitting={isSubmitting}
      apiError={apiError}
      fileTypes={fileTypes}
      departments={departments}
      majors={majors}
      subMajors={subMajors}
      courses={courses}
      subMajorDetails={rawSubMajors}
      courseDetails={rawCourses}
      majorDetails={rawMajors}
      onClose={closeUpload}
      onSubmit={handleSubmit}
    />
  );
}

export default UploadResourcePage;
