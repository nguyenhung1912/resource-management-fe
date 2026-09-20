import { GraduationCap } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import type { LookupItem } from '../../types/source-code.types';

export interface SourceCodeAcademicSectionProps {
  subMajorCode: string;
  courseCode: string;
  yearCompleted: string;
  subMajors: LookupItem[];
  courses: LookupItem[];
  subMajorError?: string;
  yearError?: string;
  disabled?: boolean;
  onSubMajorChange: (value: string) => void;
  onCourseChange: (value: string) => void;
  onYearChange: (value: string) => void;
  onClearSubMajorError: () => void;
  onClearYearError: () => void;
}

export function SourceCodeAcademicSection({
  subMajorCode,
  courseCode,
  yearCompleted,
  subMajors,
  courses,
  subMajorError,
  yearError,
  disabled = false,
  onSubMajorChange,
  onCourseChange,
  onYearChange,
  onClearSubMajorError,
  onClearYearError,
}: SourceCodeAcademicSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 border-b border-border-subtle pb-2">
        <GraduationCap className="size-4 text-primary" aria-hidden="true" />
        <h3 className="text-sm font-semibold text-text-main">Phân loại Chuyên ngành & Học vụ</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="source-code-submajor" className="text-xs font-medium text-text-main">
            Chuyên ngành <span className="text-danger">*</span>
          </Label>
          <Select
            id="source-code-submajor"
            value={subMajorCode}
            error={subMajorError}
            disabled={disabled}
            onChange={(e) => {
              onSubMajorChange(e.target.value);
              onClearSubMajorError();
            }}
          >
            <option value="">-- Chọn chuyên ngành --</option>
            {subMajors.map((subMajor) => (
              <option key={subMajor.id} value={subMajor.id}>
                {subMajor.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="source-code-course" className="text-xs font-medium text-text-main">
            Học phần liên quan
          </Label>
          <Select
            id="source-code-course"
            value={courseCode}
            disabled={disabled}
            onChange={(e) => onCourseChange(e.target.value)}
          >
            <option value="">-- Chọn học phần (tùy chọn) --</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="w-full sm:w-1/2 space-y-1.5">
        <Label htmlFor="source-code-year" className="text-xs font-medium text-text-main">
          Năm hoàn thành
        </Label>
        <Input
          id="source-code-year"
          type="number"
          placeholder="2026"
          value={yearCompleted}
          error={yearError}
          disabled={disabled}
          min={2000}
          max={new Date().getFullYear() + 1}
          onChange={(e) => {
            onYearChange(e.target.value);
            onClearYearError();
          }}
        />
      </div>
    </div>
  );
}

export default SourceCodeAcademicSection;
