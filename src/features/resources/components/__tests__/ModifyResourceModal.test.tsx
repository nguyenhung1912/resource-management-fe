import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ModifyResourceModal } from '../ModifyResourceModal';
import type { ModifyResourceInitialValues } from '../../types/resource.types';

const resource: ModifyResourceInitialValues = {
  id: 'resource-1',
  documentFileName: 'bao-cao.pdf',
  documentFileTypeName: 'PDF',
  documentFileSizeBytes: 2_516_582,
  fileName: 'Báo cáo AI',
  fileDescription: 'Mô tả nghiên cứu',
  fileTypeId: 1,
  subMajorCode: 'SE',
  courseCode: 'PRN222',
  yearCompleted: 2024,
  authorNames: ['Nguyễn Văn An'],
  keywords: ['AI', 'React'],
};

const defaultProps = {
  isOpen: true,
  resource,
  fileTypes: [
    { value: 1, label: 'Báo cáo nghiên cứu' },
    { value: 2, label: 'Đồ án' },
  ],
  subMajors: [
    { value: 'SE', label: 'Kỹ thuật phần mềm' },
    { value: 'AI', label: 'Trí tuệ nhân tạo' },
  ],
  courses: [
    { value: 'PRN222', label: 'Lập trình .NET' },
    { value: 'SWR302', label: 'Kiến trúc phần mềm' },
  ],
  onClose: vi.fn(),
  onSubmit: vi.fn(),
};

function renderModal(overrides: Partial<typeof defaultProps> = {}) {
  return render(<ModifyResourceModal {...defaultProps} {...overrides} />);
}

function chooseBanner(file: File) {
  fireEvent.change(screen.getByLabelText('Chọn ảnh banner'), {
    target: { files: [file] },
  });
}

describe('ModifyResourceModal', () => {
  it('hiển thị metadata hiện tại và giữ tệp tài liệu ở trạng thái chỉ đọc', () => {
    const { container } = renderModal();

    expect(screen.getByRole('dialog', { name: 'Chỉnh sửa tài nguyên' })).toBeInTheDocument();
    expect(screen.getByLabelText(/tên tài nguyên/i)).toHaveValue('Báo cáo AI');
    expect(screen.getByLabelText(/mô tả/i)).toHaveValue('Mô tả nghiên cứu');
    expect(screen.getByLabelText(/loại tài nguyên/i)).toHaveValue('1');
    expect(screen.getByLabelText(/chuyên ngành/i)).toHaveValue('SE');
    expect(screen.getByLabelText(/học phần/i)).toHaveValue('PRN222');
    expect(screen.getByLabelText(/năm hoàn thành/i)).toHaveValue(2024);
    expect(screen.getByText('bao-cao.pdf')).toBeInTheDocument();
    expect(screen.getByText('Tệp tài liệu không thể thay đổi.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Xóa tác giả Nguyễn Văn An' })).toBeInTheDocument();

    const keywordList = screen.getByRole('list', { name: 'Danh sách từ khóa' });
    expect(within(keywordList).getByText('AI')).toBeInTheDocument();
    expect(within(keywordList).getByText('React')).toBeInTheDocument();
    expect(container.querySelectorAll('input[type="file"]')).toHaveLength(1);
    expect(screen.getByLabelText('Chọn ảnh banner')).toBeInTheDocument();
  });

  it('từ chối ảnh banner sai định dạng', () => {
    renderModal();

    chooseBanner(new File(['image'], 'banner.gif', { type: 'image/gif' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Ảnh banner phải có định dạng PNG, JPG hoặc WEBP.');
    expect(screen.queryByText('banner.gif')).not.toBeInTheDocument();
  });

  it('từ chối ảnh banner lớn hơn 5 MB', () => {
    renderModal();
    const oversizedImage = new File(['image'], 'banner.png', { type: 'image/png' });
    Object.defineProperty(oversizedImage, 'size', { value: 5 * 1024 * 1024 + 1 });

    chooseBanner(oversizedImage);

    expect(screen.getByRole('alert')).toHaveTextContent('Dung lượng ảnh banner không được vượt quá 5 MB.');
  });

  it('không submit khi metadata bắt buộc bị thiếu', () => {
    const handleSubmit = vi.fn();
    renderModal({ onSubmit: handleSubmit });

    fireEvent.change(screen.getByLabelText(/tên tài nguyên/i), { target: { value: '  ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Lưu thay đổi' }));

    expect(screen.getByText('Vui lòng nhập tên tài nguyên.')).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('submit metadata đã chuẩn hóa và không gửi tệp tài liệu gốc', () => {
    const handleSubmit = vi.fn();
    renderModal({ onSubmit: handleSubmit });
    const bannerImage = new File(['image'], 'banner.png', { type: 'image/png' });

    fireEvent.change(screen.getByLabelText(/tên tài nguyên/i), { target: { value: '  Đề tài AI cập nhật  ' } });
    fireEvent.change(screen.getByLabelText(/mô tả/i), { target: { value: '  Mô tả mới  ' } });
    fireEvent.change(screen.getByLabelText(/loại tài nguyên/i), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText(/chuyên ngành/i), { target: { value: 'AI' } });
    fireEvent.change(screen.getByLabelText(/học phần/i), { target: { value: 'SWR302' } });
    fireEvent.change(screen.getByLabelText(/năm hoàn thành/i), { target: { value: '2025' } });
    chooseBanner(bannerImage);
    fireEvent.click(screen.getByRole('button', { name: 'Lưu thay đổi' }));

    expect(handleSubmit).toHaveBeenCalledWith({
      fileName: 'Đề tài AI cập nhật',
      fileDescription: 'Mô tả mới',
      fileTypeId: 2,
      subMajorCode: 'AI',
      courseCode: 'SWR302',
      yearCompleted: 2025,
      authorNames: ['Nguyễn Văn An'],
      keywords: ['AI', 'React'],
      bannerImage,
    });
    const submittedValues: object = handleSubmit.mock.calls[0]?.[0] ?? {};
    expect(submittedValues).not.toHaveProperty('file');
    expect(submittedValues).not.toHaveProperty('documentFileName');
  });
});
