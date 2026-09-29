import { useMemo, useState, type FormEvent } from 'react';
import { AlertCircle, Link as LinkIcon, ShieldAlert, Upload } from 'lucide-react';
import { BaseModal } from '@/components/common/BaseModal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import type { SelectOption, UploadResourceFormValues } from '@/features/resources/types/resource.types';
import type { CourseResponse, MajorResponse, SubMajorResponse } from '@/features/resources/types/academicCatalog.types';
import { AuthorInput } from './AuthorInput';
import { ResourceFileDropzone } from './ResourceFileDropzone';
import { validateCustomFileTypeName } from '@/utils/fileTypeValidation';
import { sanitizeYearInput, validateCompletionYear } from '@/utils/yearValidation';

const MAX_RESOURCE_FILE_SIZE = 50 * 1024 * 1024;
const MAX_BANNER_FILE_SIZE = 5 * 1024 * 1024;
const RESOURCE_EXTENSIONS = new Set(['pdf', 'docx', 'doc', 'pptx', 'ppt']);
const BANNER_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export interface UploadResourceModalProps {
  isOpen: boolean;
  isSubmitting?: boolean;
  apiError?: string | null;
  fileTypes: SelectOption<number>[];
  subMajors: SelectOption<string>[];
  courses: SelectOption<string>[];
  departments?: SelectOption<string>[];
  majors?: SelectOption<string>[];
  subMajorDetails?: SubMajorResponse[];
  courseDetails?: CourseResponse[];
  majorDetails?: MajorResponse[];
  onClose: () => void;
  onSubmit: (values: UploadResourceFormValues) => void | Promise<void>;
}

interface FormState {
  file: File | null;
  fileName: string;
  fileDescription: string;
  fileTypeId: string;
  customFileTypeName: string;
  departmentId: string;
  majorId: string;
  subMajorCode: string;
  courseCode: string;
  yearCompleted: string;
  authorNames: string[];
  sourceCodeUrl: string;
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
  customFileTypeName: '',
  departmentId: '',
  majorId: '',
  subMajorCode: '',
  courseCode: '',
  yearCompleted: '',
  authorNames: [],
  sourceCodeUrl: '',
  bannerImage: null,
};

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

function isValidHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return (url.protocol === 'http:' || url.protocol === 'https:') && Boolean(url.hostname);
  } catch {
    return false;
  }
}

export function UploadResourceModal({
  isOpen,
  isSubmitting = false,
  apiError = null,
  fileTypes,
  subMajors,
  courses,
  departments,
  majors,
  subMajorDetails,
  courseDetails,
  majorDetails,
  onClose,
  onSubmit,
}: UploadResourceModalProps) {
  const [form, setForm] = useState<FormState>(initialFormState);
  const [fileErrors, setFileErrors] = useState<FileErrors>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Lọc ngành theo khoa đã chọn (nếu có thông tin chi tiết)
  const filteredMajorOptions = useMemo(() => {
    if (!majors) return [];
    if (!form.departmentId || !majorDetails?.length) return majors;
    const allowedMajorIds = new Set(
      majorDetails.filter((m) => m.departmentId === form.departmentId).map((m) => m.majorId),
    );
    return majors.filter((m) => allowedMajorIds.has(m.value));
  }, [majors, form.departmentId, majorDetails]);

  // Lọc chuyên ngành theo ngành đã chọn (nếu có thông tin chi tiết)
  const filteredSubMajorOptions = useMemo(() => {
    if (!form.majorId || !subMajorDetails?.length) return subMajors;
    const allowedSubMajorCodes = new Set(
      subMajorDetails.filter((sm) => sm.majorId === form.majorId).map((sm) => sm.subMajorCode),
    );
    return subMajors.filter((sm) => allowedSubMajorCodes.has(sm.value));
  }, [subMajors, form.majorId, subMajorDetails]);

  // Lọc học phần theo chuyên ngành đã chọn (nếu có thông tin chi tiết)
  const filteredCourseOptions = useMemo(() => {
    if (!form.subMajorCode || !courseDetails?.length) return courses;
    const allowedCourseCodes = new Set(
      courseDetails.filter((c) => c.subMajorCode === form.subMajorCode).map((c) => c.courseCode),
    );
    return courses.filter((c) => allowedCourseCodes.has(c.value));
  }, [courses, form.subMajorCode, courseDetails]);

  const handleDepartmentChange = (deptId: string) => {
    setForm((current) => {
      let newMajorId = current.majorId;
      let newSubMajorCode = current.subMajorCode;
      let newCourseCode = current.courseCode;

      if (deptId && majorDetails?.length) {
        const major = majorDetails.find((m) => m.majorId === current.majorId);
        if (major && major.departmentId !== deptId) {
          newMajorId = '';
          newSubMajorCode = '';
          newCourseCode = '';
        }
      }

      return {
        ...current,
        departmentId: deptId,
        majorId: newMajorId,
        subMajorCode: newSubMajorCode,
        courseCode: newCourseCode,
      };
    });
  };

  const handleMajorChange = (majId: string) => {
    setForm((current) => {
      let newDeptId = current.departmentId;
      if (majId && majorDetails?.length) {
        const major = majorDetails.find((m) => m.majorId === majId);
        if (major?.departmentId) {
          newDeptId = major.departmentId;
        }
      }

      let newSubMajorCode = current.subMajorCode;
      let newCourseCode = current.courseCode;
      if (majId && subMajorDetails?.length) {
        const subMajor = subMajorDetails.find((sm) => sm.subMajorCode === current.subMajorCode);
        if (subMajor && subMajor.majorId !== majId) {
          newSubMajorCode = '';
          newCourseCode = '';
        }
      }

      return {
        ...current,
        departmentId: newDeptId,
        majorId: majId,
        subMajorCode: newSubMajorCode,
        courseCode: newCourseCode,
      };
    });
  };

  const handleSubMajorChange = (subMajorCode: string) => {
    setForm((current) => {
      let newMajorId = current.majorId;
      let newDeptId = current.departmentId;

      if (subMajorCode && subMajorDetails?.length) {
        const subMajor = subMajorDetails.find((sm) => sm.subMajorCode === subMajorCode);
        if (subMajor?.majorId) {
          newMajorId = subMajor.majorId;
          if (majorDetails?.length) {
            const major = majorDetails.find((m) => m.majorId === subMajor.majorId);
            if (major?.departmentId) {
              newDeptId = major.departmentId;
            }
          }
        }
      }

      let newCourseCode = current.courseCode;
      if (subMajorCode && courseDetails?.length) {
        const course = courseDetails.find((c) => c.courseCode === current.courseCode);
        if (course && course.subMajorCode !== subMajorCode) {
          newCourseCode = '';
        }
      }

      return {
        ...current,
        departmentId: newDeptId,
        majorId: newMajorId,
        subMajorCode,
        courseCode: newCourseCode,
      };
    });
  };

  const handleCourseChange = (courseCode: string) => {
    setForm((current) => {
      let newSubMajorCode = current.subMajorCode;
      let newMajorId = current.majorId;
      let newDeptId = current.departmentId;

      if (courseCode && courseDetails?.length) {
        const course = courseDetails.find((c) => c.courseCode === courseCode);
        if (course?.subMajorCode && !newSubMajorCode) {
          newSubMajorCode = course.subMajorCode;
          if (subMajorDetails?.length) {
            const subMajor = subMajorDetails.find((sm) => sm.subMajorCode === course.subMajorCode);
            if (subMajor?.majorId) {
              newMajorId = subMajor.majorId;
              if (majorDetails?.length) {
                const major = majorDetails.find((m) => m.majorId === subMajor.majorId);
                if (major?.departmentId) {
                  newDeptId = major.departmentId;
                }
              }
            }
          }
        }
      }

      return {
        ...current,
        departmentId: newDeptId,
        majorId: newMajorId,
        subMajorCode: newSubMajorCode,
        courseCode,
      };
    });
  };

  const resourceFileError =
    fileErrors.resource ?? (isSubmitted && !form.file ? 'Vui lòng chọn tệp tài nguyên.' : undefined);
  const fileNameError =
    isSubmitted && !form.fileName.trim()
      ? 'Vui lòng nhập tên tài nguyên.'
      : form.fileName.length > 255
        ? 'Tên tài nguyên không được vượt quá 255 ký tự.'
        : undefined;
  const isOtherFileTypeSelected = useMemo(() => {
    if (!form.fileTypeId) return false;
    const selected = fileTypes.find((ft) => String(ft.value) === String(form.fileTypeId));
    return selected?.label.trim().toLowerCase() === 'khác' || Number(form.fileTypeId) === 10;
  }, [fileTypes, form.fileTypeId]);

  const handleFileTypeChange = (newFileTypeId: string) => {
    const selected = fileTypes.find((ft) => String(ft.value) === String(newFileTypeId));
    const isOther = selected?.label.trim().toLowerCase() === 'khác' || Number(newFileTypeId) === 10;
    setForm((current) => ({
      ...current,
      fileTypeId: newFileTypeId,
      customFileTypeName: isOther ? current.customFileTypeName : '',
    }));
  };

  const customFileTypeValidation = useMemo(() => {
    if (!isOtherFileTypeSelected) return { isValid: true };
    return validateCustomFileTypeName(form.customFileTypeName);
  }, [isOtherFileTypeSelected, form.customFileTypeName]);

  const customFileTypeError =
    isSubmitted && isOtherFileTypeSelected && !customFileTypeValidation.isValid
      ? customFileTypeValidation.error
      : undefined;

  const fileTypeError = isSubmitted && !form.fileTypeId ? 'Vui lòng chọn loại tài nguyên.' : undefined;
  const subMajorError = isSubmitted && !form.subMajorCode ? 'Vui lòng chọn chuyên ngành.' : undefined;
  const authorsError = isSubmitted && form.authorNames.length === 0 ? 'Vui lòng nhập ít nhất một tác giả.' : undefined;
  const trimmedSourceCodeUrl = form.sourceCodeUrl.trim();
  const hasInvalidSourceCodeUrl = Boolean(trimmedSourceCodeUrl) && !isValidHttpUrl(trimmedSourceCodeUrl);
  const hasLongSourceCodeUrl = trimmedSourceCodeUrl.length > 500;
  const sourceCodeUrlError = hasLongSourceCodeUrl
    ? 'Liên kết mã nguồn không được vượt quá 500 ký tự.'
    : isSubmitted && hasInvalidSourceCodeUrl
      ? 'Liên kết mã nguồn phải là URL hợp lệ sử dụng giao thức http:// hoặc https://.'
      : undefined;
  const yearValidation = validateCompletionYear(form.yearCompleted, isSubmitted);
  const yearError = yearValidation.error;

  const updateField = <TKey extends keyof FormState>(key: TKey, value: FormState[TKey]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleResourceFile = (file: File) => {
    const validationError = getResourceFileError(file);
    setFileErrors((current) => ({ ...current, resource: validationError }));
    if (validationError) return;

    const baseName = file.name.replace(/\.[^.]+$/, '');
    setForm((current) => ({
      ...current,
      file,
      fileName: baseName,
    }));
  };

  const handleRemoveResourceFile = () => {
    setForm((current) => ({
      ...current,
      file: null,
      fileName: '',
    }));
    setFileErrors((current) => ({ ...current, resource: undefined }));
  };

  const handleBannerFile = (file: File) => {
    const validationError = getBannerFileError(file);
    setFileErrors((current) => ({ ...current, banner: validationError }));
    if (!validationError) {
      updateField('bannerImage', file);
    }
  };

  const resetAndClose = () => {
    if (isSubmitting) return;

    setForm(initialFormState);
    setFileErrors({});
    setIsSubmitted(false);
    onClose();
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitted(true);
    const selectedFile = form.file;
    const submitYearValidation = validateCompletionYear(form.yearCompleted, true);

    const hasError =
      !selectedFile ||
      !form.fileName.trim() ||
      form.fileName.length > 255 ||
      !form.fileTypeId ||
      Boolean(customFileTypeError) ||
      (isOtherFileTypeSelected && !customFileTypeValidation.isValid) ||
      !form.subMajorCode ||
      form.authorNames.length === 0 ||
      hasInvalidSourceCodeUrl ||
      hasLongSourceCodeUrl ||
      Boolean(resourceFileError) ||
      Boolean(fileErrors.banner) ||
      !submitYearValidation.isValid;

    if (hasError || isSubmitting || !selectedFile) return;

    void onSubmit({
      file: selectedFile,
      fileName: form.fileName.trim(),
      fileDescription: form.fileDescription.trim() || null,
      fileTypeId: Number(form.fileTypeId),
      customFileTypeName: isOtherFileTypeSelected
        ? customFileTypeValidation.sanitized || form.customFileTypeName.trim()
        : null,
      subMajorCode: form.subMajorCode,
      courseCode: form.courseCode || null,
      yearCompleted: submitYearValidation.numericYear,
      authorNames: form.authorNames,
      sourceCodeUrl: trimmedSourceCodeUrl || null,
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
      showCloseButton={!isSubmitting}
      fullScreenOnMobile
      footer={footer}
    >
      <form id="upload-resource-form" noValidate aria-busy={isSubmitting} className="space-y-5" onSubmit={handleSubmit}>
        {apiError ? (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-lg border border-danger/20 bg-danger/5 p-3.5 text-xs leading-relaxed text-danger"
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
            onFileRemove={handleRemoveResourceFile}
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

        {departments && departments.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="resource-department">Khoa / Đơn vị</Label>
              <Select
                id="resource-department"
                value={form.departmentId}
                disabled={isSubmitting}
                onChange={(event) => handleDepartmentChange(event.target.value)}
              >
                <option value="">Tất cả khoa / đơn vị</option>
                {departments.map((dept) => (
                  <option key={dept.value} value={dept.value}>
                    {dept.label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="resource-major">Ngành đào tạo</Label>
              <Select
                id="resource-major"
                value={form.majorId}
                disabled={isSubmitting}
                onChange={(event) => handleMajorChange(event.target.value)}
              >
                <option value="">Tất cả ngành đào tạo</option>
                {filteredMajorOptions.map((major) => (
                  <option key={major.value} value={major.value}>
                    {major.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="resource-file-type" requiredBadge error={Boolean(fileTypeError)}>
              Loại tài nguyên
            </Label>
            <Select
              id="resource-file-type"
              value={form.fileTypeId}
              disabled={isSubmitting}
              error={fileTypeError}
              onChange={(event) => handleFileTypeChange(event.target.value)}
            >
              <option value="">Chọn loại tài nguyên</option>
              {fileTypes.map((fileType) => (
                <option key={fileType.value} value={fileType.value}>
                  {fileType.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="resource-sub-major" requiredBadge error={Boolean(subMajorError)}>
              Chuyên ngành
            </Label>
            <Select
              id="resource-sub-major"
              value={form.subMajorCode}
              disabled={isSubmitting}
              error={subMajorError}
              onChange={(event) => handleSubMajorChange(event.target.value)}
            >
              <option value="">Chọn chuyên ngành</option>
              {filteredSubMajorOptions.map((subMajor) => (
                <option key={subMajor.value} value={subMajor.value}>
                  {subMajor.label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {isOtherFileTypeSelected ? (
          <div className="space-y-1.5">
            <Label htmlFor="resource-custom-file-type" requiredBadge error={Boolean(customFileTypeError)}>
              Tên loại tài nguyên khác
            </Label>
            <Input
              id="resource-custom-file-type"
              maxLength={50}
              placeholder="Nhập tên loại tài nguyên (ví dụ: Tài liệu tham khảo, Đề cương...)"
              value={form.customFileTypeName}
              error={customFileTypeError}
              disabled={isSubmitting}
              onChange={(event) => updateField('customFileTypeName', event.target.value)}
            />
            <p className="text-xs text-text-muted">
              Tối đa 50 ký tự. Chỉ cho phép chữ cái, chữ số, khoảng trắng và các dấu (- , () , . , + , #).
            </p>
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="resource-course">Học phần</Label>
            <Select
              id="resource-course"
              value={form.courseCode}
              disabled={isSubmitting}
              onChange={(event) => handleCourseChange(event.target.value)}
            >
              <option value="">Không chọn học phần</option>
              {filteredCourseOptions.map((course) => (
                <option key={course.value} value={course.value}>
                  {course.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="resource-year" error={Boolean(yearError)}>
              Năm hoàn thành
            </Label>
            <Input
              id="resource-year"
              type="text"
              inputMode="numeric"
              maxLength={4}
              placeholder="YYYY (VD: 2024)"
              value={form.yearCompleted}
              error={yearError}
              disabled={isSubmitting}
              onChange={(event) => updateField('yearCompleted', sanitizeYearInput(event.target.value))}
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

        <div className="space-y-2">
          <Label htmlFor="resource-source-code-url" error={Boolean(sourceCodeUrlError)}>
            Đính kèm mã nguồn (Không bắt buộc)
          </Label>
          <Input
            id="resource-source-code-url"
            type="url"
            maxLength={501}
            placeholder="https://github.com/... hoặc https://gitlab.com/..."
            value={form.sourceCodeUrl}
            error={sourceCodeUrlError}
            helperText={!sourceCodeUrlError ? 'Dán liên kết công khai đến kho lưu trữ hoặc tệp mã nguồn.' : undefined}
            disabled={isSubmitting}
            iconLeft={<LinkIcon className="h-4 w-4" aria-hidden="true" />}
            onChange={(event) => updateField('sourceCodeUrl', event.target.value)}
          />
          <div
            role="note"
            aria-label="Lưu ý:"
            className="flex items-start gap-2.5 rounded-lg border border-warning/30 bg-warning/10 p-3.5 text-xs leading-relaxed text-text-main"
          >
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
            <p>
              <span className="font-semibold">Lưu ý: </span>
              Không được nhập những liên kết chứa virus hay phần mềm độc hại. Mọi vi phạm có thể dẫn đến khóa tài khoản
              vĩnh viễn.
            </p>
          </div>
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
