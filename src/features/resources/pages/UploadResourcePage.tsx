import { useNavigate } from 'react-router-dom';
import { APP_PATHS } from '@/constants/path';
import { UploadResourceModal } from '@/features/resources/components/UploadResourceModal';
import { useUploadResource } from '@/features/resources/hooks/useUploadResource';
import type { SelectOption, UploadResourceFormValues } from '@/features/resources/types/resource.types';

// Tạm giữ các danh mục hiện tại đến khi tích hợp API danh mục.
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

  const closeUpload = () => {
    void navigate(APP_PATHS.RESOURCES_MANAGER);
  };

  const handleSubmit = async (values: UploadResourceFormValues) => {
    const isUploaded = await uploadResource(values);
    if (isUploaded) closeUpload();
  };

  return (
    <UploadResourceModal
      isOpen
      isSubmitting={isSubmitting}
      apiError={apiError}
      fileTypes={previewFileTypes}
      subMajors={previewSubMajors}
      courses={previewCourses}
      onClose={closeUpload}
      onSubmit={handleSubmit}
    />
  );
}

export default UploadResourcePage;
