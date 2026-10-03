// import { RotateCcw } from 'lucide-react';
// import { Button } from '@/components/ui/Button';
// import { Input } from '@/components/ui/Input';
// import { FACULTY_OPTIONS } from '../../constants/search.constants';

// export interface SearchAdvancedFilterTabProps {
//   selectedFaculty: string;
//   onFacultyChange: (faculty: string) => void;
//   onReset: () => void;
//   onApply: () => void;
// }

// export function SearchAdvancedFilterTab({
//   selectedFaculty,
//   onFacultyChange,
//   onReset,
//   onApply,
// }: SearchAdvancedFilterTabProps) {
//   return (
//     <div className="rounded-2xl border border-border-subtle bg-surface p-6 space-y-4">
//       <h2 className="text-base font-bold text-text-main">Tiêu chí Lọc Nâng cao</h2>

//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//         <div>
//           <label className="text-xs font-semibold text-text-main block mb-1">Khoa / Bộ môn</label>
//           <select
//             value={selectedFaculty}
//             onChange={(e) => onFacultyChange(e.target.value)}
//             className="w-full h-10 rounded-lg border border-border-subtle bg-background px-3 text-xs text-text-main focus:outline-none focus:border-primary"
//           >
//             {FACULTY_OPTIONS.map((opt) => (
//               <option key={opt.value} value={opt.value}>
//                 {opt.label}
//               </option>
//             ))}
//           </select>
//         </div>

//         <div>
//           <label className="text-xs font-semibold text-text-main block mb-1">Năm phát hành</label>
//           <Input placeholder="Ví dụ: 2025" />
//         </div>

//         <div>
//           <label className="text-xs font-semibold text-text-main block mb-1">Định dạng tệp</label>
//           <select className="w-full h-10 rounded-lg border border-border-subtle bg-background px-3 text-xs text-text-main focus:outline-none focus:border-primary">
//             <option value="all">Tất cả định dạng</option>
//             <option value="pdf">PDF</option>
//             <option value="docx">Word (.docx)</option>
//             <option value="zip">Mã nguồn nén (.zip)</option>
//           </select>
//         </div>

//         <div>
//           <label className="text-xs font-semibold text-text-main block mb-1">Tỷ lệ đạo văn AI</label>
//           <select className="w-full h-10 rounded-lg border border-border-subtle bg-background px-3 text-xs text-text-main focus:outline-none focus:border-primary">
//             <option value="all">Tất cả tỷ lệ</option>
//             <option value="safe">Dưới 15% (An toàn cao)</option>
//             <option value="warning">Dưới 25% (Tiêu chuẩn)</option>
//           </select>
//         </div>
//       </div>

//       <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-subtle">
//         <Button variant="outline" size="sm" onClick={onReset}>
//           <RotateCcw className="size-3.5 mr-1" aria-hidden="true" />
//           Đặt lại
//         </Button>
//         <Button variant="primary" size="sm" onClick={onApply}>
//           Áp dụng bộ lọc
//         </Button>
//       </div>
//     </div>
//   );
// }

// export default SearchAdvancedFilterTab;
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { LookupItem } from '../../types/search.types';
// Xóa bỏ import FACULTY_OPTIONS tĩnh đi
// import { FACULTY_OPTIONS } from '../../constants/search.constants';

export interface SearchAdvancedFilterTabProps {
  // DỮ LIỆU ĐỘNG (Được truyền từ Loader xuống)
  submajors: LookupItem[];
  fileTypes: LookupItem[];

  // STATE NĂM VÀ CÁC HÀM XỬ LÝ (Giữ nguyên)
  selectedFaculty: string;
  onFacultyChange: (faculty: string) => void;
  selectedYear: string;
  onYearChange: (year: string) => void;
  selectedFormat: string;
  onFormatChange: (format: string) => void;
  onReset: () => void;
  onApply: () => void;
}

export function SearchAdvancedFilterTab({
  submajors = [], // Nhận dữ liệu thật
  fileTypes = [], // Nhận dữ liệu thật
  selectedFaculty,
  onFacultyChange,
  selectedYear,
  onYearChange,
  selectedFormat,
  onFormatChange,
  onReset,
  onApply,
}: SearchAdvancedFilterTabProps) {
  return (
    <div className="rounded-2xl border border-border-subtle bg-surface p-6 space-y-4">
      <h2 className="text-base font-bold text-text-main">Tiêu chí Lọc Nâng cao</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Khoa / Bộ môn (Đã sử dụng dữ liệu động từ API) */}
        <div>
          <label className="text-xs font-semibold text-text-main block mb-1">Tất cả Ngành</label>
          <select
            value={selectedFaculty}
            onChange={(e) => onFacultyChange(e.target.value)}
            className="w-full h-10 rounded-lg border border-border-subtle bg-background px-3 text-xs text-text-main focus:outline-none focus:border-primary"
          >
            <option value="all">Tất cả Ngành</option>
            {submajors.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.name}
              </option>
            ))}
          </select>
        </div>

        {/* 2. Năm phát hành (Giữ nguyên Input, không cần API) */}
        <div>
          <label className="text-xs font-semibold text-text-main block mb-1">Năm phát hành</label>
          <Input
            placeholder="Ví dụ: 2024"
            value={selectedYear}
            onChange={(e) => onYearChange(e.target.value)}
            type="number"
          />
        </div>

        {/* 3. Định dạng tệp (Đã sử dụng dữ liệu động từ API) */}
        <div>
          <label className="text-xs font-semibold text-text-main block mb-1">Định dạng tệp</label>
          <select
            value={selectedFormat}
            onChange={(e) => onFormatChange(e.target.value)}
            className="w-full h-10 rounded-lg border border-border-subtle bg-background px-3 text-xs text-text-main focus:outline-none focus:border-primary"
          >
            <option value="all">Tất cả định dạng</option>
            {fileTypes.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.name}
              </option>
            ))}
          </select>
        </div>

        {/* 4. Tỷ lệ đạo văn (Đóng băng chờ chỉ thị mới) */}
        <div>
          <label className="text-xs font-semibold text-text-main block mb-1">Tỷ lệ đạo văn AI</label>
          <select
            disabled
            className="w-full h-10 rounded-lg border border-border-subtle bg-background px-3 text-xs text-text-main focus:outline-none focus:border-primary opacity-50 cursor-not-allowed"
          >
            <option value="all">Tính năng đang phát triển...</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-subtle">
        <Button variant="outline" size="sm" onClick={onReset}>
          <RotateCcw className="size-3.5 mr-1" aria-hidden="true" />
          Đặt lại
        </Button>
        <Button variant="primary" size="sm" onClick={onApply}>
          Áp dụng bộ lọc
        </Button>
      </div>
    </div>
  );
}

export default SearchAdvancedFilterTab;
