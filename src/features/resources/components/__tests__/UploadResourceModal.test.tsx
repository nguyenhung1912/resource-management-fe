import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { UploadResourceModal } from '../UploadResourceModal';

const defaultProps = {
  isOpen: true,
  fileTypes: [
    { value: 1, label: 'Báo cáo nghiên cứu' },
    { value: 2, label: 'Đồ án' },
  ],
  subMajors: [
    { value: 'SE', label: 'Kỹ thuật phần mềm' },
    { value: 'AI', label: 'Trí tuệ nhân tạo' },
  ],
  courses: [{ value: 'PRN222', label: 'Lập trình .NET' }],
  onClose: vi.fn(),
  onSubmit: vi.fn(),
};

function renderModal(overrides: Partial<typeof defaultProps> = {}) {
  return render(<UploadResourceModal {...defaultProps} {...overrides} />);
}

function chooseMainFile(file: File) {
  fireEvent.change(screen.getByLabelText('Chọn tệp tài nguyên'), {
    target: { files: [file] },
  });
}

describe('UploadResourceModal', () => {
  it('chỉ cho phép cuộn bên trong dialog upload', () => {
    renderModal();
    const backdrop = screen.getByRole('presentation');
    const form = document.getElementById('upload-resource-form');
    const modalBody = form?.parentElement;

    if (!modalBody) {
      throw new Error('Không tìm thấy body của dialog upload');
    }

    expect(backdrop).toHaveClass('overflow-hidden');
    expect(backdrop).not.toHaveClass('overflow-y-auto');
    expect(modalBody).toHaveClass('overflow-y-auto', 'overscroll-contain');
  });

  it('hiển thị dialog upload toàn màn hình trên màn hình nhỏ', () => {
    renderModal();
    const backdrop = screen.getByRole('presentation');
    const dialog = screen.getByRole('dialog');
    const form = document.getElementById('upload-resource-form');
    const modalBody = form?.parentElement;

    if (!modalBody) {
      throw new Error('Không tìm thấy body của dialog upload');
    }

    expect(backdrop).toHaveClass('p-0', 'sm:p-6');
    expect(dialog).toHaveClass(
      'm-0',
      'h-dvh',
      'max-h-dvh',
      'rounded-none',
      'border-0',
      'sm:my-auto',
      'sm:h-auto',
      'sm:max-h-[calc(100dvh-3rem)]',
      'sm:rounded-xl',
      'sm:border',
    );
    expect(modalBody).toHaveClass('min-h-0', 'max-h-none', 'flex-1', 'sm:max-h-[calc(85vh-130px)]', 'sm:flex-none');
  });

  it('hiển thị đầy đủ các trường tương ứng với yêu cầu upload của backend', () => {
    renderModal();

    expect(screen.getByRole('dialog', { name: 'Tải lên tài nguyên mới' })).toBeInTheDocument();
    expect(screen.getByLabelText(/tên tài nguyên/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mô tả/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/loại tài nguyên/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/chuyên ngành/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/học phần/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/năm hoàn thành/i)).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /nhập tác giả/i })).toBeInTheDocument();
    expect(screen.getByLabelText('Chọn ảnh banner')).toBeInTheDocument();
    expect(screen.queryByLabelText(/github/i)).not.toBeInTheDocument();
  });

  it('nhận tệp hợp lệ và tự điền tên tài nguyên từ tên tệp', () => {
    renderModal();

    chooseMainFile(new File(['noi dung'], 'bao-cao-nghien-cuu.pdf', { type: 'application/pdf' }));

    expect(screen.getByText('bao-cao-nghien-cuu.pdf')).toBeInTheDocument();
    expect(screen.getByLabelText(/tên tài nguyên/i)).toHaveValue('bao-cao-nghien-cuu');
  });

  it.each(['doc', 'docx', 'ppt', 'pptx'])('nhận tệp tài liệu định dạng %s', (extension) => {
    renderModal();

    chooseMainFile(new File(['noi dung'], `tai-lieu.${extension}`, { type: 'application/octet-stream' }));

    expect(screen.getByText(`tai-lieu.${extension}`)).toBeInTheDocument();
  });

  it('từ chối tệp sai định dạng', () => {
    renderModal();

    chooseMainFile(new File(['data'], 'bang-du-lieu.xlsx', { type: 'application/octet-stream' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Chỉ hỗ trợ tệp PDF, DOCX, DOC, PPTX hoặc PPT.');
    expect(screen.queryByText('bang-du-lieu.xlsx')).not.toBeInTheDocument();
  });

  it('từ chối tệp lớn hơn 50 MB', () => {
    renderModal();
    const oversizedFile = new File(['large'], 'bai-thuyet-trinh.pptx', {
      type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    });
    Object.defineProperty(oversizedFile, 'size', { value: 50 * 1024 * 1024 + 1 });

    chooseMainFile(oversizedFile);

    expect(screen.getByRole('alert')).toHaveTextContent('Dung lượng tệp không được vượt quá 50 MB.');
  });

  it('thêm nhiều tên tác giả bằng phím Enter và bỏ qua tên trùng', () => {
    renderModal();
    const authorInput = screen.getByRole('textbox', { name: /nhập tác giả/i });

    fireEvent.change(authorInput, { target: { value: '  Nguyễn Văn An  ' } });
    fireEvent.keyDown(authorInput, { key: 'Enter' });
    fireEvent.change(authorInput, { target: { value: 'Trần Minh Bình' } });
    fireEvent.keyDown(authorInput, { key: 'Enter' });
    fireEvent.change(authorInput, { target: { value: 'nguyễn văn an' } });
    fireEvent.keyDown(authorInput, { key: 'Enter' });

    expect(screen.getByRole('button', { name: 'Xóa tác giả Nguyễn Văn An' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Xóa tác giả Trần Minh Bình' })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /xóa tác giả/i })).toHaveLength(2);
  });

  it('không submit và hiển thị lỗi cho các trường bắt buộc', () => {
    const handleSubmit = vi.fn();
    renderModal({ onSubmit: handleSubmit });

    fireEvent.click(screen.getByRole('button', { name: 'Tải lên ngay' }));

    expect(screen.getByText('Vui lòng chọn tệp tài nguyên.')).toBeInTheDocument();
    expect(screen.getByText('Vui lòng nhập tên tài nguyên.')).toBeInTheDocument();
    expect(screen.getByText('Vui lòng chọn loại tài nguyên.')).toBeInTheDocument();
    expect(screen.getByText('Vui lòng chọn chuyên ngành.')).toBeInTheDocument();
    expect(screen.getByText('Vui lòng nhập ít nhất một tác giả.')).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('submit đúng dữ liệu đã chuẩn hóa khi form hợp lệ', () => {
    const handleSubmit = vi.fn();
    renderModal({ onSubmit: handleSubmit });
    const resourceFile = new File(['noi dung'], 'resource.pdf', { type: 'application/pdf' });
    const bannerImage = new File(['image'], 'banner.png', { type: 'image/png' });

    chooseMainFile(resourceFile);
    fireEvent.change(screen.getByLabelText(/tên tài nguyên/i), { target: { value: '  Đề tài AI  ' } });
    fireEvent.change(screen.getByLabelText(/mô tả/i), { target: { value: '  Mô tả nghiên cứu  ' } });
    fireEvent.change(screen.getByLabelText(/loại tài nguyên/i), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText(/chuyên ngành/i), { target: { value: 'AI' } });
    fireEvent.change(screen.getByLabelText(/học phần/i), { target: { value: 'PRN222' } });
    fireEvent.change(screen.getByLabelText(/năm hoàn thành/i), { target: { value: '2025' } });
    const authorInput = screen.getByRole('textbox', { name: /nhập tác giả/i });
    fireEvent.change(authorInput, { target: { value: 'Nguyễn Văn An' } });
    fireEvent.keyDown(authorInput, { key: 'Enter' });
    fireEvent.change(authorInput, { target: { value: 'Trần Minh Bình' } });
    fireEvent.keyDown(authorInput, { key: 'Enter' });
    fireEvent.change(screen.getByLabelText('Chọn ảnh banner'), { target: { files: [bannerImage] } });
    fireEvent.click(screen.getByRole('button', { name: 'Tải lên ngay' }));

    expect(handleSubmit).toHaveBeenCalledWith({
      file: resourceFile,
      fileName: 'Đề tài AI',
      fileDescription: 'Mô tả nghiên cứu',
      fileTypeId: 1,
      subMajorCode: 'AI',
      courseCode: 'PRN222',
      yearCompleted: 2025,
      authorNames: ['Nguyễn Văn An', 'Trần Minh Bình'],
      bannerImage,
    });
  });

  it('gọi onClose khi người dùng chọn Hủy', () => {
    const handleClose = vi.fn();
    renderModal({ onClose: handleClose });

    fireEvent.click(screen.getByRole('button', { name: 'Hủy' }));

    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
