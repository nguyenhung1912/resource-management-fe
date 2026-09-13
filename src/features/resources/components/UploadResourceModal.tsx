import { useState, type FormEvent } from 'react';
import { AlertCircle, Upload } from 'lucide-react';
import { BaseModal } from '@/components/common/BaseModal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { cn } from '@/utils/cn';
import type { SelectOption, UploadResourceFormValues } from '@/features/resources/types/resource.types';
import { AuthorInput } from './AuthorInput';
import { ResourceFileDropzone } from './ResourceFileDropzone';

const MAX_RESOURCE_FILE_SIZE = 50 * 1024 * 1024;
const MAX_BANNER_FILE_SIZE = 5 * 1024 * 1024;
const RESOURCE_EXTENSIONS = new Set(['pdf', 'docx', 'doc', 'pptx', 'ppt']);
const BANNER_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const CURRENT_YEAR = new Date().getFullYear();

export interface UploadResourceModalProps {
  isOpen: boolean;
  isSubmitting?: boolean;
  apiError?: string | null;
  fileTypes: SelectOption<number>[];
  subMajors: SelectOption<string>[];
  courses: SelectOption<string>[];
  onClose: () => void;
  onSubmit: (values: UploadResourceFormValues) => void | Promise<void>;
}

interface FormState {
  file: File | null;
  fileName: string;
  fileDescription: string;
  fileTypeId: string;
  subMajorCode: string;
  courseCode: string;
  yearCompleted: string;
  authorNames: string[];
  bannerImage: File | null;
}

interface FileErrors {
  resource?: string;
  banner?: string;
}

const initialFormState: FormState = {
  file: null,
  fileName: '',
  fileDescription: '',
  fileTypeId: '',
  subMajorCode: '',
  courseCode: '',
  yearCompleted: '',
  authorNames: [],
  bannerImage: null,
};

const selectClassName =
  'h-10 w-full rounded-lg border border-border-subtle bg-surface px-3 text-sm text-text-main outline-none transition-colors focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-50';

function getFileExtension(fileName: string) {
  return fileName.split('.').pop()?.toLowerCase() ?? '';
}

function getResourceFileError(file: File) {
  if (!RESOURCE_EXTENSIONS.has(getFileExtension(file.name))) {
    return 'Chỉ hỗ trợ tệp PDF, DOCX, DOC, PPTX hoặc PPT.';
  }
  if (file.size > MAX_RESOURCE_FILE_SIZE) {
    return 'Dung lượng tệp không được vượt quá 50 MB.';
  }
  return undefined;
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

export function UploadResourceModal({
  isOpen,
  isSubmitting = false,
  apiError = null,
  fileTypes,
  subMajors,
  courses,
  onClose,
  onSubmit,
}: UploadResourceModalProps) {
  const [form, setForm] = useState<FormState>(initialFormState);
  const [fileErrors, setFileErrors] = useState<FileErrors>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const resourceFileError =
    fileErrors.resource ?? (isSubmitted && !form.file ? 'Vui lòng chọn tệp tài nguyên.' : undefined);
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

  const handleResourceFile = (file: File) => {
    const validationError = getResourceFileError(file);
    setFileErrors((current) => ({ ...current, resource: validationError }));
    if (validationError) return;

    setForm((current) => ({
      ...current,
      file,
      fileName: current.fileName.trim() || file.name.replace(/\.[^.]+$/, ''),
    }));
  };

  const handleBannerFile = (file: File) => {
    const validationError = getBannerFileError(file);
    setFileErrors((current) => ({ ...current, banner: validationError }));
    if (!validationError) {
      updateField('bannerImage', file);
    }
  };

  const resetAndClose = () => {
    setForm(initialFormState);
    setFileErrors({});
    setIsSubmitted(false);
    onClose();
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitted(true);
    const selectedFile = form.file;

    const hasError =
      !selectedFile ||
      !form.fileName.trim() ||
      form.fileName.length > 255 ||
      !form.fileTypeId ||
      !form.subMajorCode ||
      form.authorNames.length === 0 ||
      Boolean(resourceFileError) ||
      Boolean(fileErrors.banner) ||
      Boolean(yearError);

    if (hasError || isSubmitting || !selectedFile) return;

    void onSubmit({
      file: selectedFile,
      fileName: form.fileName.trim(),
      fileDescription: form.fileDescription.trim() || null,
      fileTypeId: Number(form.fileTypeId),
      subMajorCode: form.subMajorCode,
      courseCode: form.courseCode || null,
      yearCompleted: numericYear,
      authorNames: form.authorNames,
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
        form="upload-resource-form"
        isLoading={isSubmitting}
        iconLeft={<Upload className="h-4 w-4" aria-hidden="true" />}
      >
        {isSubmitting ? 'Đang tải lên…' : 'Tải lên ngay'}
      </Button>
    </>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={resetAndClose}
      title="Tải lên tài nguyên mới"
      description="Thêm tài liệu và thông tin phục vụ phân loại, tìm kiếm."
      maxWidth="2xl"
      closeOnBackdropClick={!isSubmitting}
      closeOnEscape={!isSubmitting}
      fullScreenOnMobile
      footer={footer}
    >
      <form id="upload-resource-form" noValidate className="space-y-5" onSubmit={handleSubmit}>
        {apiError ? (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3.5 text-xs leading-relaxed text-danger"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <div>
              <span className="font-semibold">Không thể tải tài nguyên: </span>
              {apiError}
            </div>
          </div>
        ) : null}

        <div className="space-y-1.5">
          <Label requiredBadge error={Boolean(resourceFileError)}>
            Tệp tài nguyên
          </Label>
          <ResourceFileDropzone
            id="resource-file"
            label="Chọn tệp tài nguyên"
            description="Hỗ trợ PDF, DOCX, DOC, PPTX, PPT · Tối đa 50 MB"
            accept=".pdf,.docx,.doc,.pptx,.ppt"
            file={form.file}
            error={resourceFileError}
            disabled={isSubmitting}
            onFileSelect={handleResourceFile}
            onFileRemove={() => updateField('file', null)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="resource-file-name" requiredBadge error={Boolean(fileNameError)}>
            Tên tài nguyên
          </Label>
          <Input
            id="resource-file-name"
            maxLength={256}
            placeholder="Nhập tên tài nguyên..."
            value={form.fileName}
            error={fileNameError}
            disabled={isSubmitting}
            onChange={(event) => updateField('fileName', event.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="resource-description">Mô tả</Label>
          <Textarea
            id="resource-description"
            placeholder="Thêm mô tả hoặc từ khóa liên quan..."
            value={form.fileDescription}
            disabled={isSubmitting}
            className="min-h-24 resize-none"
            onChange={(event) => updateField('fileDescription', event.target.value)}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="resource-file-type" requiredBadge error={Boolean(fileTypeError)}>
              Loại tài nguyên
            </Label>
            <select
              id="resource-file-type"
              value={form.fileTypeId}
              disabled={isSubmitting}
              aria-invalid={Boolean(fileTypeError)}
              aria-describedby={fileTypeError ? 'resource-file-type-error' : undefined}
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
              <p id="resource-file-type-error" role="alert" className="text-xs text-danger">
                {fileTypeError}
              </p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="resource-sub-major" requiredBadge error={Boolean(subMajorError)}>
              Chuyên ngành
            </Label>
            <select
              id="resource-sub-major"
              value={form.subMajorCode}
              disabled={isSubmitting}
              aria-invalid={Boolean(subMajorError)}
              aria-describedby={subMajorError ? 'resource-sub-major-error' : undefined}
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
              <p id="resource-sub-major-error" role="alert" className="text-xs text-danger">
                {subMajorError}
              </p>
            ) : null}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="resource-course">Học phần</Label>
            <select
              id="resource-course"
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
            <Label htmlFor="resource-year" error={Boolean(yearError)}>
              Năm hoàn thành
            </Label>
            <Input
              id="resource-year"
              type="number"
              inputMode="numeric"
              min={1900}
              max={CURRENT_YEAR}
              placeholder="YYYY"
              value={form.yearCompleted}
              error={yearError}
              disabled={isSubmitting}
              onChange={(event) => updateField('yearCompleted', event.target.value)}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="resource-authors" requiredBadge error={Boolean(authorsError)}>
            Tác giả
          </Label>
          <AuthorInput
            id="resource-authors"
            authorNames={form.authorNames}
            error={authorsError}
            disabled={isSubmitting}
            onChange={(authorNames) => updateField('authorNames', authorNames)}
          />
        </div>

        <div className="space-y-1.5 border-t border-border-subtle pt-5">
          <Label>Ảnh banner</Label>
          <ResourceFileDropzone
            id="resource-banner"
            label="Chọn ảnh banner"
            description="Hỗ trợ PNG, JPG, WEBP · Tối đa 5 MB"
            accept="image/png,image/jpeg,image/webp"
            file={form.bannerImage}
            error={fileErrors.banner}
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

export default UploadResourceModal;
