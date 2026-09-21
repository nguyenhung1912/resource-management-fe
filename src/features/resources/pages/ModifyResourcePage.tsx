import { useNavigate, useParams, useRevalidator } from 'react-router-dom';
import { APP_PATHS } from '@/constants/path';
import { ModifyResourceModal } from '@/features/resources/components/ModifyResourceModal';
import type { ModifyResourceInitialValues, SelectOption } from '@/features/resources/types/resource.types';

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

function createPreviewResource(resourceId: string): ModifyResourceInitialValues {
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

export function ModifyResourcePage() {
  const navigate = useNavigate();
  const revalidator = useRevalidator();
  const { resourceId = 'resource-1' } = useParams();
  const previewResource = createPreviewResource(resourceId);

  const closeModify = () => {
    void navigate(APP_PATHS.RESOURCES_MANAGER);
  };

  const handleSubmit = () => {
    revalidator.revalidate();
    closeModify();
  };

  return (
    <ModifyResourceModal
      isOpen
      resource={previewResource}
      fileTypes={previewFileTypes}
      subMajors={previewSubMajors}
      courses={previewCourses}
      onClose={closeModify}
      onSubmit={handleSubmit}
    />
  );
}

export default ModifyResourcePage;
