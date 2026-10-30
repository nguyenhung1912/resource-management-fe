import { useCallback, useRef, useState, type SyntheticEvent } from 'react';
import type { UploadSourceCodeFormValues } from '@/features/digital-resources/source-code/types/source-code.types';
import { isValidGithubUrl } from '@/features/digital-resources/source-code/utils/sourceCodeUtils';
import { resourceService } from '@/services/resourceService';
import { uploadErrorMessage } from '@/features/resources/utils/uploadErrorMessage';
import type { ProcessingJob } from '@/features/processing/types/processing.types';

export const ALLOWED_SOURCE_CODE_EXTENSIONS = new Set(['zip', 'rar', '7z', 'tar', 'gz', 'pdf', 'docx']);

export const MAX_SOURCE_CODE_FILE_SIZE = 50 * 1024 * 1024; // 50 MB
export const MAX_BANNER_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
export const ALLOWED_BANNER_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export interface UploadSourceCodeValidationErrors {
  file?: string;
  fileName?: string;
  subMajorCode?: string;
  courseCode?: string;
  yearCompleted?: string;
  githubLink?: string;
  authorIds?: string;
  bannerImage?: string;
}

export interface UseUploadSourceCodeOptions {
  fileTypeId?: number | null;
  onSuccess?: () => void;
  onAccepted?: (job: ProcessingJob) => void;
}

export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? (parts.pop()?.toLowerCase() ?? '') : '';
}

export function validateSourceCodeFile(file: File | null): string | undefined {
  if (!file) {
    return 'Vui lòng chọn tệp mã nguồn hoặc tài liệu dự án.';
  }

  const extension = getFileExtension(file.name);
  if (!ALLOWED_SOURCE_CODE_EXTENSIONS.has(extension)) {
    return 'Chỉ hỗ trợ tệp nén (.zip, .rar, .7z, .tar, .gz) hoặc tài liệu (.pdf, .docx).';
  }

  if (file.size > MAX_SOURCE_CODE_FILE_SIZE) {
    return 'Dung lượng tệp không được vượt quá 50 MB.';
  }

  return undefined;
}

export function validateBannerFile(file: File | null): string | undefined {
  if (!file) return undefined;

  if (!ALLOWED_BANNER_MIME_TYPES.has(file.type)) {
    return 'Ảnh bìa phải có định dạng JPEG, PNG hoặc WEBP.';
  }

  if (file.size > MAX_BANNER_FILE_SIZE) {
    return 'Dung lượng ảnh bìa không được vượt quá 5 MB.';
  }

  return undefined;
}

export function useUploadSourceCode({ fileTypeId, onSuccess, onAccepted }: UseUploadSourceCodeOptions) {
  const [file, setFileState] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [fileDescription, setFileDescription] = useState('');
  const [subMajorCode, setSubMajorCode] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [yearCompleted, setYearCompleted] = useState<string>(() => String(new Date().getFullYear()));
  const [authorIds, setAuthorIds] = useState<string[]>([]);
  const [githubLink, setGithubLink] = useState('');
  const [bannerImage, setBannerImageState] = useState<File | null>(null);

  const [errors, setErrors] = useState<UploadSourceCodeValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const uploading = useRef(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const clearError = useCallback((field: keyof UploadSourceCodeValidationErrors) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const setFile = useCallback(
    (newFile: File | null) => {
      setFileState(newFile);
      clearError('file');

      if (!newFile) {
        setFileName('');
        return;
      }

      const defaultName = newFile.name.replace(/\.[^/.]+$/, '');
      setFileName(defaultName);
      clearError('fileName');
    },
    [clearError],
  );

  const setBannerImage = useCallback(
    (newBanner: File | null) => {
      setBannerImageState(newBanner);
      clearError('bannerImage');
    },
    [clearError],
  );

  const addAuthorId = useCallback((newId: string) => {
    const trimmed = newId.trim();
    if (!trimmed) return;
    setAuthorIds((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed]));
    setErrors((prev) => {
      if (!prev.authorIds) return prev;
      const next = { ...prev };
      delete next.authorIds;
      return next;
    });
  }, []);

  const removeAuthorId = useCallback((targetId: string) => {
    setAuthorIds((prev) => prev.filter((id) => id !== targetId));
  }, []);

  const validateForm = useCallback((): boolean => {
    const nextErrors: UploadSourceCodeValidationErrors = {};

    const fileError = validateSourceCodeFile(file);
    if (fileError) {
      nextErrors.file = fileError;
    } else if (!fileTypeId || fileTypeId <= 0) {
      nextErrors.file = 'Chưa xác định được danh mục loại tài liệu từ hệ thống.';
    }

    const trimmedFileName = fileName.trim();
    if (!trimmedFileName) {
      nextErrors.fileName = 'Vui lòng nhập tên đề tài / dự án mã nguồn.';
    } else if (trimmedFileName.length > 255) {
      nextErrors.fileName = 'Tên dự án không được vượt quá 255 ký tự.';
    }

    if (!subMajorCode.trim()) {
      nextErrors.subMajorCode = 'Vui lòng chọn chuyên ngành đào tạo.';
    }

    if (yearCompleted.trim()) {
      const year = Number(yearCompleted.trim());
      const currentYear = new Date().getFullYear();
      if (!Number.isInteger(year) || year < 2000 || year > currentYear + 1) {
        nextErrors.yearCompleted = `Năm hoàn thành không hợp lệ (từ 2000 đến ${currentYear + 1}).`;
      }
    }

    if (githubLink.trim() && !isValidGithubUrl(githubLink.trim())) {
      nextErrors.githubLink = 'Đường dẫn GitHub không hợp lệ (ví dụ: https://github.com/user/repo).';
    }

    const validAuthors = authorIds.filter((id) => id.trim().length > 0);
    if (validAuthors.length === 0) {
      nextErrors.authorIds = 'Phải có ít nhất một tác giả thực hiện đề tài.';
    }

    const bannerError = validateBannerFile(bannerImage);
    if (bannerError) {
      nextErrors.bannerImage = bannerError;
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }, [authorIds, bannerImage, file, fileName, fileTypeId, githubLink, subMajorCode, yearCompleted]);

  const resetForm = useCallback(() => {
    setFileState(null);
    setFileName('');
    setFileDescription('');
    setSubMajorCode('');
    setCourseCode('');
    setYearCompleted(String(new Date().getFullYear()));
    setAuthorIds([]);
    setGithubLink('');
    setBannerImageState(null);
    setErrors({});
    setApiError(null);
    setIsSuccess(false);
    setIsSubmitting(false);
  }, []);

  const handleSubmit = useCallback(
    async (e?: SyntheticEvent): Promise<boolean> => {
      if (e) {
        e.preventDefault();
      }

      if (uploading.current) return false;
      setApiError(null);
      setIsSuccess(false);

      const isValid = validateForm();
      if (!isValid || !file || !fileTypeId) {
        return false;
      }

      uploading.current = true;
      setIsSubmitting(true);

      const validAuthors = authorIds.filter((id) => id.trim().length > 0);
      const payload: UploadSourceCodeFormValues = {
        file,
        fileName: fileName.trim(),
        fileDescription: fileDescription.trim() || undefined,
        fileTypeId,
        subMajorCode: subMajorCode.trim(),
        courseCode: courseCode.trim() || undefined,
        yearCompleted: yearCompleted.trim() ? Number(yearCompleted.trim()) : undefined,
        authorNames: validAuthors,
        authorIds: validAuthors,
        githubLink: githubLink.trim() || undefined,
        bannerImage,
      };

      try {
        const response = await resourceService.uploadResource(payload);
        if (response?.data?.processingJob) {
          onAccepted?.(response.data.processingJob);
        } else {
          setIsSuccess(true);
          onSuccess?.();
        }
        return true;
      } catch (err: unknown) {
        const errorMsg = uploadErrorMessage(err);
        setApiError(errorMsg);
        return false;
      } finally {
        uploading.current = false;
        setIsSubmitting(false);
      }
    },
    [
      authorIds,
      bannerImage,
      courseCode,
      file,
      fileDescription,
      fileName,
      fileTypeId,
      githubLink,
      onSuccess,
      onAccepted,
      subMajorCode,
      validateForm,
      yearCompleted,
    ],
  );

  return {
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
    setAuthorIds,
    addAuthorId,
    removeAuthorId,
    setGithubLink,
    setBannerImage,
    errors,
    clearError,
    validateForm,
    isSubmitting,
    apiError,
    isSuccess,
    resetForm,
    handleSubmit,
  };
}
