import type { SubmitEvent } from 'react';
import { Code2, Sparkles } from 'lucide-react';
import { AlertBanner } from '@/components/common/AlertBanner';
import { BaseModal } from '@/components/common/BaseModal';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useUploadSourceCode } from '../hooks/useUploadSourceCode';
import type { ProcessingJob } from '@/features/processing/types/processing.types';
import type { LookupItem } from '../types/source-code.types';
import {
  SourceCodeAcademicSection,
  SourceCodeAuthorsSection,
  SourceCodeBannerSection,
  SourceCodeBasicInfoSection,
  SourceCodeFileSection,
  SourceCodeRepositorySection,
} from './upload';

export interface UploadSourceCodeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onAccepted?: (job: ProcessingJob) => void;
  fileTypeId?: number | null;
  fileTypes?: LookupItem[];
  subMajors: LookupItem[];
  courses: LookupItem[];
}

export function UploadSourceCodeDialog({
  isOpen,
  onClose,
  onSuccess,
  onAccepted,
  fileTypeId,
  fileTypes,
  subMajors,
  courses,
}: UploadSourceCodeDialogProps) {
  // Phân giải fileTypeId từ lookups thực tế của backend thay vì hardcode
  const resolvedFileTypeId =
    fileTypeId ??
    (() => {
      const match = fileTypes?.find((ft) => /mã nguồn|source\s*code|source|manguon/i.test(ft.name));
      if (match) return Number(match.id);
      return fileTypes && fileTypes.length > 0 ? Number(fileTypes[0].id) : undefined;
    })();

  const handleUploadSuccess = () => {
    onSuccess?.();
    onClose();
  };

  const {
    file,
    fileName,
    fileDescription,
    subMajorCode,
    courseCode,
    yearCompleted,
    authorIds,
    githubLink,
    bannerImage,
    setFile,
    setFileName,
    setFileDescription,
    setSubMajorCode,
    setCourseCode,
    setYearCompleted,
    addAuthorId,
    removeAuthorId,
    setGithubLink,
    setBannerImage,
    errors,
    clearError,
    isSubmitting,
    apiError,
    resetForm,
    handleSubmit,
  } = useUploadSourceCode({
    fileTypeId: resolvedFileTypeId,
    onSuccess: handleUploadSuccess,
    onAccepted: (job) => {
      onClose();
      onAccepted?.(job);
    },
  });

  const handleClose = () => {
    if (isSubmitting) return;
    resetForm();
    onClose();
  };

  const onSubmitForm = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    void handleSubmit();
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      maxWidth="2xl"
      title={
        <div className="flex items-center gap-2 flex-wrap">
          <span>Đăng tải Mã nguồn & Dự án mẫu</span>
          <Badge variant="primary" showDot className="text-xs font-semibold">
            Mã nguồn
          </Badge>
        </div>
      }
      description={
        <span>Tải lên mã nguồn, liên kết GitHub và thông tin học vụ của dự án để chia sẻ học liệu lập trình.</span>
      }
      icon={
        <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
          <Code2 className="size-5" aria-hidden="true" />
        </div>
      }
      footer={
        <div className="flex items-center justify-end gap-3 w-full sm:w-auto">
          <Button type="button" variant="outline" size="md" disabled={isSubmitting} onClick={handleClose}>
            Hủy
          </Button>
          <Button
            type="submit"
            form="upload-source-code-form"
            variant="primary"
            size="md"
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            <Sparkles className="size-4 mr-1.5" aria-hidden="true" />
            Đăng tải dự án
          </Button>
        </div>
      }
    >
      <form id="upload-source-code-form" noValidate onSubmit={onSubmitForm} className="space-y-6 py-1">
        {/* API Error Alert */}
        {apiError && <AlertBanner type="danger" title="Lỗi đăng tải" message={apiError} />}

        {/* Section 1: File mã nguồn chính */}
        <SourceCodeFileSection
          file={file}
          error={errors.file}
          disabled={isSubmitting}
          onFileSelect={setFile}
          onFileRemove={() => setFile(null)}
        />

        {/* Section 2: Thông tin đề tài */}
        <SourceCodeBasicInfoSection
          fileName={fileName}
          fileDescription={fileDescription}
          error={errors.fileName}
          disabled={isSubmitting}
          onNameChange={setFileName}
          onDescriptionChange={setFileDescription}
          onClearError={() => clearError('fileName')}
        />

        {/* Section 3: Kho lưu trữ GitHub */}
        <SourceCodeRepositorySection
          githubLink={githubLink}
          error={errors.githubLink}
          disabled={isSubmitting}
          onChange={setGithubLink}
          onClearError={() => clearError('githubLink')}
        />

        {/* Section 4: Phân loại Học vụ & Đào tạo */}
        <SourceCodeAcademicSection
          subMajorCode={subMajorCode}
          courseCode={courseCode}
          yearCompleted={yearCompleted}
          subMajors={subMajors}
          courses={courses}
          subMajorError={errors.subMajorCode}
          yearError={errors.yearCompleted}
          disabled={isSubmitting}
          onSubMajorChange={setSubMajorCode}
          onCourseChange={setCourseCode}
          onYearChange={setYearCompleted}
          onClearSubMajorError={() => clearError('subMajorCode')}
          onClearYearError={() => clearError('yearCompleted')}
        />

        {/* Section 5: Tác giả thực hiện */}
        <SourceCodeAuthorsSection
          authorIds={authorIds}
          error={errors.authorIds}
          disabled={isSubmitting}
          onAddAuthor={addAuthorId}
          onRemoveAuthor={removeAuthorId}
        />

        {/* Section 6: Ảnh bìa Thumbnail */}
        <SourceCodeBannerSection
          bannerImage={bannerImage}
          error={errors.bannerImage}
          disabled={isSubmitting}
          onImageSelect={setBannerImage}
          onImageRemove={() => setBannerImage(null)}
        />
      </form>
    </BaseModal>
  );
}

export default UploadSourceCodeDialog;
