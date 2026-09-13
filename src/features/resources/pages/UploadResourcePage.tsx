import { useNavigate } from 'react-router-dom';
import { APP_PATHS } from '@/constants/path';
import { UploadResourceModal } from '@/features/resources/components/UploadResourceModal';
import type { SelectOption } from '@/features/resources/types/resource.types';

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

const previewAuthors: SelectOption<string>[] = [
  { value: 'author-1', label: 'Nguyễn Văn An' },
  { value: 'author-2', label: 'Trần Minh Bình' },
  { value: 'author-3', label: 'Lê Hoàng Anh' },
];

export function UploadResourcePage() {
  const navigate = useNavigate();

  const closeUpload = () => {
    void navigate(APP_PATHS.RESOURCES_MANAGER);
  };

  const handlePreviewSubmit = () => {
    closeUpload();
  };

  return (
    <UploadResourceModal
      isOpen
      fileTypes={previewFileTypes}
      subMajors={previewSubMajors}
      courses={previewCourses}
      authors={previewAuthors}
      onClose={closeUpload}
      onSubmit={handlePreviewSubmit}
    />
  );
}

export default UploadResourcePage;
