import { useState, type FormEvent } from 'react';
import { BookOpen } from 'lucide-react';

import { AlertBanner } from '@/components/common/AlertBanner';
import { BaseModal } from '@/components/common/BaseModal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';

import { academicService } from '@/services/academicService';
import { getApiErrorMessage } from '@/utils/getApiErrorMessage';

import type { Course, SubMajor } from '../types/academic.types';

interface CourseModalProps {
  isOpen: boolean;
  subMajors: SubMajor[];
  course?: Course | null;
  defaultSubMajorCode?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function CourseModal({
  isOpen,
  subMajors,
  course,
  defaultSubMajorCode = '',
  onClose,
  onSuccess,
}: CourseModalProps) {
  const [courseName, setCourseName] = useState(course?.courseName ?? '');

  const [subMajorCode, setSubMajorCode] = useState(course?.subMajorCode ?? defaultSubMajorCode);

  const [nameError, setNameError] = useState<string>();

  const [subMajorError, setSubMajorError] = useState<string>();

  const [error, setError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = Boolean(course);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const name = courseName.trim();

    let hasError = false;

    if (!subMajorCode) {
      setSubMajorError('Vui lòng chọn chuyên ngành.');

      hasError = true;
    }

    if (!name) {
      setNameError('Vui lòng nhập tên học phần.');

      hasError = true;
    }

    if (hasError) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      if (course) {
        await academicService.updateCourse({
          courseCode: course.courseCode,
          courseName: name,
          subMajorCode,
        });
      } else {
        await academicService.createCourse({
          courseName: name,
          subMajorCode,
        });
      }

      onSuccess();
    } catch (submitError) {
      setError(
        getApiErrorMessage(submitError, isEditing ? 'Không thể cập nhật học phần.' : 'Không thể thêm học phần.'),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      closeOnEscape={!isSubmitting}
      closeOnBackdropClick={!isSubmitting}
      title={isEditing ? 'Cập nhật học phần' : 'Thêm học phần'}
      description={isEditing ? 'Chỉnh sửa thông tin học phần.' : 'Thêm học phần mới vào chuyên ngành.'}
      icon={
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <BookOpen className="size-5" />
        </div>
      }
      footer={
        <>
          <Button variant="secondary" disabled={isSubmitting} onClick={onClose}>
            Hủy
          </Button>

          <Button type="submit" form="course-form" isLoading={isSubmitting}>
            {isEditing ? 'Lưu thay đổi' : 'Thêm học phần'}
          </Button>
        </>
      }
    >
      <form id="course-form" onSubmit={handleSubmit} className="space-y-5">
        {error && <AlertBanner type="danger" message={error} />}

        <div className="space-y-2">
          <Label htmlFor="courseSubMajor" requiredBadge error={Boolean(subMajorError)}>
            Chuyên ngành
          </Label>

          <Select
            id="courseSubMajor"
            value={subMajorCode}
            disabled={isSubmitting}
            error={subMajorError}
            onChange={(event) => {
              setSubMajorCode(event.target.value);

              setSubMajorError(undefined);
            }}
          >
            <option value="">-- Chọn chuyên ngành --</option>

            {subMajors.map((subMajor) => (
              <option key={subMajor.subMajorCode} value={subMajor.subMajorCode}>
                {subMajor.subMajorName}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="courseName" requiredBadge error={Boolean(nameError)}>
            Tên học phần
          </Label>

          <Input
            id="courseName"
            autoFocus
            value={courseName}
            disabled={isSubmitting}
            error={nameError}
            placeholder="Ví dụ: Lập trình Web"
            onChange={(event) => {
              setCourseName(event.target.value);

              setNameError(undefined);
            }}
          />
        </div>
      </form>
    </BaseModal>
  );
}

export default CourseModal;
