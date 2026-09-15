import { useState, type FormEvent } from 'react';
import { AlertCircle, FileText, Save } from 'lucide-react';
import { BaseModal } from '@/components/common/BaseModal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import type {
  ModifyResourceFormValues,
  ModifyResourceInitialValues,
  SelectOption,
} from '@/features/resources/types/resource.types';
import { cn } from '@/utils/cn';
import { AuthorInput } from './AuthorInput';
import { KeywordInput } from './KeywordInput';
import { ResourceFileDropzone } from './ResourceFileDropzone';

const MAX_BANNER_FILE_SIZE = 5 * 1024 * 1024;
const BANNER_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const CURRENT_YEAR = new Date().getFullYear();

interface FormState {
  fileName: string;
  fileDescription: string;
  fileTypeId: string;
  subMajorCode: string;
  courseCode: string;
  yearCompleted: string;
  authorNames: string[];
  keywords: string[];
  bannerImage: File | null;
}

export interface ModifyResourceModalProps {
  isOpen: boolean;
  isSubmitting?: boolean;
  apiError?: string | null;
  resource: ModifyResourceInitialValues;
  fileTypes: SelectOption<number>[];
  subMajors: SelectOption<string>[];
  courses: SelectOption<string>[];
  onClose: () => void;
  onSubmit: (values: ModifyResourceFormValues) => void | Promise<void>;
}

const selectClassName =
  'h-10 w-full rounded-lg border border-border-subtle bg-surface px-3 text-sm text-text-main outline-none transition-colors focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-50';

function createInitialFormState(resource: ModifyResourceInitialValues): FormState {
  return {
    fileName: resource.fileName,
    fileDescription: resource.fileDescription ?? '',
    fileTypeId: String(resource.fileTypeId),
    subMajorCode: resource.subMajorCode,
    courseCode: resource.courseCode ?? '',
    yearCompleted: resource.yearCompleted === null ? '' : String(resource.yearCompleted),
    authorNames: resource.authorNames,
    keywords: resource.keywords,
    bannerImage: null,
  };
}

function getBannerFileError(file: File) {
  if (!BANNER_TYPES.has(file.type)) {
    return 'Ảnh banner phải có định dạng PNG, JPG hoặc WEBP.';
  }
  if (file.size > MAX_BANNER_FILE_SIZE) {
    return 'Dung lượng ảnh banner không được vượt quá 5 MB.';
  }
  return undefined;
}

function formatFileSize(bytes: number | null) {
  if (bytes === null) return 'Không xác định';
  const megabytes = bytes / (1024 * 1024);
  return `${megabytes.toLocaleString('vi-VN', { maximumFractionDigits: 1 })} MB`;
}

export function ModifyResourceModal({
  isOpen,
  isSubmitting = false,
  apiError = null,
  resource,
  fileTypes,
  subMajors,
  courses,
  onClose,
  onSubmit,
}: ModifyResourceModalProps) {
  const [form, setForm] = useState<FormState>(() => createInitialFormState(resource));
  const [bannerError, setBannerError] = useState<string>();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const fileNameError =
    isSubmitted && !form.fileName.trim()
      ? 'Vui lòng nhập tên tài nguyên.'
      : form.fileName.length > 255
        ? 'Tên tài nguyên không được vượt quá 255 ký tự.'
        : undefined;
  const fileTypeError = isSubmitted && !form.fileTypeId ? 'Vui lòng chọn loại tài nguyên.' : undefined;
  const subMajorError = isSubmitted && !form.subMajorCode ? 'Vui lòng chọn chuyên ngành.' : undefined;
  const authorsError = isSubmitted && form.authorNames.length === 0 ? 'Vui lòng nhập ít nhất một tác giả.' : undefined;
  const numericYear = form.yearCompleted ? Number(form.yearCompleted) : null;
  const yearError =
    form.yearCompleted &&
    (!Number.isInteger(numericYear) || numericYear === null || numericYear < 1900 || numericYear > CURRENT_YEAR)
      ? `Năm hoàn thành phải nằm trong khoảng 1900–${CURRENT_YEAR}.`
      : undefined;

  const updateField = <TKey extends keyof FormState>(key: TKey, value: FormState[TKey]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleBannerFile = (file: File) => {
    const validationError = getBannerFileError(file);
    setBannerError(validationError);
    if (!validationError) updateField('bannerImage', file);
  };

  const resetAndClose = () => {
    setForm(createInitialFormState(resource));
    setBannerError(undefined);
    setIsSubmitted(false);
    onClose();
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitted(true);

    const hasError =
      !form.fileName.trim() ||
      form.fileName.length > 255 ||
      !form.fileTypeId ||
      !form.subMajorCode ||
      form.authorNames.length === 0 ||
      Boolean(bannerError) ||
      Boolean(yearError);

    if (hasError || isSubmitting) return;

    void onSubmit({
      fileName: form.fileName.trim(),
      fileDescription: form.fileDescription.trim() || null,
      fileTypeId: Number(form.fileTypeId),
      subMajorCode: form.subMajorCode,
      courseCode: form.courseCode || null,
      yearCompleted: numericYear,
      authorNames: form.authorNames,
      keywords: form.keywords,
      bannerImage: form.bannerImage,
    });
  };

  const footer = (
    <>
      <Button type="button" variant="ghost" disabled={isSubmitting} onClick={resetAndClose}>
        Hủy
      </Button>
      <Button
        type="submit"
        form="modify-resource-form"
        isLoading={isSubmitting}
        iconLeft={<Save className="h-4 w-4" aria-hidden="true" />}
      >
        {isSubmitting ? 'Đang lưu…' : 'Lưu thay đổi'}
      </Button>
    </>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={resetAndClose}
      title="Chỉnh sửa tài nguyên"
      description="Cập nhật metadata và ảnh banner của tài nguyên."
      maxWidth="2xl"
      closeOnBackdropClick={!isSubmitting}
      closeOnEscape={!isSubmitting}
      fullScreenOnMobile
      footer={footer}
    >
      <form id="modify-resource-form" noValidate className="space-y-5" onSubmit={handleSubmit}>
        {apiError ? (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3.5 text-xs leading-relaxed text-danger"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <div>
              <span className="font-semibold">Không thể lưu thay đổi: </span>
              {apiError}
            </div>
          </div>
        ) : null}

        <section aria-labelledby="current-document-heading" className="space-y-2">
          <Label id="current-document-heading">Tệp tài liệu hiện tại</Label>
          <div className="flex items-center gap-3 rounded-lg border border-border-subtle bg-background/60 p-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileText className="size-5" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-text-main" title={resource.documentFileName}>
                {resource.documentFileName}
              </p>
              <p className="mt-0.5 text-xs text-text-muted">
                {resource.documentFileTypeName} · {formatFileSize(resource.documentFileSizeBytes)}
              </p>
            </div>
          </div>
          <p className="text-xs text-text-muted">Tệp tài liệu không thể thay đổi.</p>
        </section>

        <div className="space-y-1.5">
          <Label htmlFor="modify-resource-file-name" requiredBadge error={Boolean(fileNameError)}>
            Tên tài nguyên
          </Label>
          <Input
            id="modify-resource-file-name"
            maxLength={256}
            value={form.fileName}
            error={fileNameError}
            disabled={isSubmitting}
            onChange={(event) => updateField('fileName', event.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="modify-resource-description">Mô tả</Label>
          <Textarea
            id="modify-resource-description"
            value={form.fileDescription}
            disabled={isSubmitting}
            className="min-h-24 resize-none"
            onChange={(event) => updateField('fileDescription', event.target.value)}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="modify-resource-file-type" requiredBadge error={Boolean(fileTypeError)}>
              Loại tài nguyên
            </Label>
            <select
              id="modify-resource-file-type"
              value={form.fileTypeId}
              disabled={isSubmitting}
              aria-invalid={Boolean(fileTypeError)}
              aria-describedby={fileTypeError ? 'modify-resource-file-type-error' : undefined}
              className={cn(selectClassName, fileTypeError && 'border-danger')}
              onChange={(event) => updateField('fileTypeId', event.target.value)}
            >
              <option value="">Chọn loại tài nguyên</option>
              {fileTypes.map((fileType) => (
                <option key={fileType.value} value={fileType.value}>
                  {fileType.label}
                </option>
              ))}
            </select>
            {fileTypeError ? (
              <p id="modify-resource-file-type-error" role="alert" className="text-xs text-danger">
                {fileTypeError}
              </p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="modify-resource-sub-major" requiredBadge error={Boolean(subMajorError)}>
              Chuyên ngành
            </Label>
            <select
              id="modify-resource-sub-major"
              value={form.subMajorCode}
              disabled={isSubmitting}
              aria-invalid={Boolean(subMajorError)}
              aria-describedby={subMajorError ? 'modify-resource-sub-major-error' : undefined}
              className={cn(selectClassName, subMajorError && 'border-danger')}
              onChange={(event) => updateField('subMajorCode', event.target.value)}
            >
              <option value="">Chọn chuyên ngành</option>
              {subMajors.map((subMajor) => (
                <option key={subMajor.value} value={subMajor.value}>
                  {subMajor.label}
                </option>
              ))}
            </select>
            {subMajorError ? (
              <p id="modify-resource-sub-major-error" role="alert" className="text-xs text-danger">
                {subMajorError}
              </p>
            ) : null}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="modify-resource-course">Học phần</Label>
            <select
              id="modify-resource-course"
              value={form.courseCode}
              disabled={isSubmitting}
              className={selectClassName}
              onChange={(event) => updateField('courseCode', event.target.value)}
            >
              <option value="">Không chọn học phần</option>
              {courses.map((course) => (
                <option key={course.value} value={course.value}>
                  {course.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="modify-resource-year" error={Boolean(yearError)}>
              Năm hoàn thành
            </Label>
            <Input
              id="modify-resource-year"
              type="number"
              inputMode="numeric"
              min={1900}
              max={CURRENT_YEAR}
              value={form.yearCompleted}
              error={yearError}
              disabled={isSubmitting}
              onChange={(event) => updateField('yearCompleted', event.target.value)}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="modify-resource-authors" requiredBadge error={Boolean(authorsError)}>
            Tác giả
          </Label>
          <AuthorInput
            id="modify-resource-authors"
            authorNames={form.authorNames}
            error={authorsError}
            disabled={isSubmitting}
            onChange={(authorNames) => updateField('authorNames', authorNames)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="modify-resource-keywords">Từ khóa</Label>
          <KeywordInput
            id="modify-resource-keywords"
            keywords={form.keywords}
            disabled={isSubmitting}
            onChange={(keywords) => updateField('keywords', keywords)}
          />
        </div>

        <div className="space-y-1.5 border-t border-border-subtle pt-5">
          <Label>Ảnh banner</Label>
          <ResourceFileDropzone
            id="modify-resource-banner"
            label="Chọn ảnh banner"
            description="Hỗ trợ PNG, JPG, WEBP · Tối đa 5 MB"
            accept="image/png,image/jpeg,image/webp"
            file={form.bannerImage}
            error={bannerError}
            disabled={isSubmitting}
            variant="image"
            onFileSelect={handleBannerFile}
            onFileRemove={() => updateField('bannerImage', null)}
          />
        </div>
      </form>
    </BaseModal>
  );
}

export default ModifyResourceModal;
