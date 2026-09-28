import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  SourceCodeAcademicSection,
  SourceCodeAuthorsSection,
  SourceCodeBannerSection,
  SourceCodeBasicInfoSection,
  SourceCodeFileSection,
  SourceCodeRepositorySection,
} from '../index';

describe('Upload Sections Isolated Tests', () => {
  describe('SourceCodeFileSection', () => {
    it('render nhãn bắt buộc và dropzone', () => {
      render(<SourceCodeFileSection file={null} onFileSelect={vi.fn()} onFileRemove={vi.fn()} />);

      expect(screen.getByText('Tệp mã nguồn dự án')).toBeInTheDocument();
      expect(screen.getByText(/Chấp nhận tệp nén/i)).toBeInTheDocument();
    });
  });

  describe('SourceCodeBasicInfoSection', () => {
    it('kích hoạt onNameChange và onClearError khi nhập tên dự án', () => {
      const onNameChange = vi.fn();
      const onClearError = vi.fn();

      render(
        <SourceCodeBasicInfoSection
          fileName=""
          fileDescription=""
          onNameChange={onNameChange}
          onDescriptionChange={vi.fn()}
          onClearError={onClearError}
        />,
      );

      const nameInput = screen.getByLabelText(/Tên đề tài \/ Dự án mã nguồn/i);
      fireEvent.change(nameInput, { target: { value: 'Dự án mới' } });

      expect(onNameChange).toHaveBeenCalledWith('Dự án mới');
      expect(onClearError).toHaveBeenCalledTimes(1);
    });

    it('kích hoạt onDescriptionChange khi nhập mô tả', () => {
      const onDescriptionChange = vi.fn();

      render(
        <SourceCodeBasicInfoSection
          fileName="Tên"
          fileDescription=""
          onNameChange={vi.fn()}
          onDescriptionChange={onDescriptionChange}
          onClearError={vi.fn()}
        />,
      );

      const descInput = screen.getByLabelText(/Mô tả dự án & Công nghệ sử dụng/i);
      fireEvent.change(descInput, { target: { value: 'Mô tả chi tiết' } });

      expect(onDescriptionChange).toHaveBeenCalledWith('Mô tả chi tiết');
    });
  });

  describe('SourceCodeRepositorySection', () => {
    it('kích hoạt onChange và onClearError khi nhập link GitHub', () => {
      const onChange = vi.fn();
      const onClearError = vi.fn();

      render(<SourceCodeRepositorySection githubLink="" onChange={onChange} onClearError={onClearError} />);

      const repoInput = screen.getByLabelText(/Kho lưu trữ GitHub/i);
      fireEvent.change(repoInput, { target: { value: 'https://github.com/qnu/project' } });

      expect(onChange).toHaveBeenCalledWith('https://github.com/qnu/project');
      expect(onClearError).toHaveBeenCalledTimes(1);
    });
  });

  describe('SourceCodeAcademicSection', () => {
    const mockSubMajors = [{ id: 'CNTT', name: 'Công nghệ thông tin' }];
    const mockCourses = [{ id: 'OOP', name: 'Lập trình hướng đối tượng' }];

    it('render đầy đủ dropdown chuyên ngành và học phần', () => {
      const onSubMajorChange = vi.fn();
      const onClearSubMajorError = vi.fn();

      render(
        <SourceCodeAcademicSection
          subMajorCode=""
          courseCode=""
          yearCompleted="2026"
          subMajors={mockSubMajors}
          courses={mockCourses}
          onSubMajorChange={onSubMajorChange}
          onCourseChange={vi.fn()}
          onYearChange={vi.fn()}
          onClearSubMajorError={onClearSubMajorError}
          onClearYearError={vi.fn()}
        />,
      );

      const subMajorSelect = screen.getByLabelText(/Chuyên ngành/i);
      expect(subMajorSelect).toBeInTheDocument();

      fireEvent.change(subMajorSelect, { target: { value: 'CNTT' } });
      expect(onSubMajorChange).toHaveBeenCalledWith('CNTT');
      expect(onClearSubMajorError).toHaveBeenCalledTimes(1);
    });
  });

  describe('SourceCodeAuthorsSection', () => {
    it('thêm tác giả khi nhấn nút Thêm hoặc phím Enter và xóa tác giả khi click nút X', () => {
      const onAddAuthor = vi.fn();
      const onRemoveAuthor = vi.fn();

      render(
        <SourceCodeAuthorsSection
          authorIds={['Nguyễn Văn A']}
          onAddAuthor={onAddAuthor}
          onRemoveAuthor={onRemoveAuthor}
        />,
      );

      expect(screen.getByText('Nguyễn Văn A')).toBeInTheDocument();

      // Test xóa tác giả
      const removeBtn = screen.getByRole('button', { name: 'Xóa tác giả Nguyễn Văn A' });
      fireEvent.click(removeBtn);
      expect(onRemoveAuthor).toHaveBeenCalledWith('Nguyễn Văn A');

      // Test thêm tác giả bằng nút Thêm
      const authorInput = screen.getByPlaceholderText(/Nhập họ và tên tác giả/i);
      fireEvent.change(authorInput, { target: { value: 'Trần Thị B' } });

      const addBtn = screen.getByRole('button', { name: 'Thêm tác giả' });
      fireEvent.click(addBtn);
      expect(onAddAuthor).toHaveBeenCalledWith('Trần Thị B');

      // Test thêm tác giả bằng phím Enter
      fireEvent.change(authorInput, { target: { value: 'Lê Văn C' } });
      fireEvent.keyDown(authorInput, { key: 'Enter' });
      expect(onAddAuthor).toHaveBeenCalledWith('Lê Văn C');
    });
  });

  describe('SourceCodeBannerSection', () => {
    it('render dropzone ảnh bìa thumbnail', () => {
      render(<SourceCodeBannerSection bannerImage={null} onImageSelect={vi.fn()} onImageRemove={vi.fn()} />);

      expect(screen.getByText(/Ảnh bìa \/ Thumbnail dự án/i)).toBeInTheDocument();
      expect(screen.getByLabelText('Ảnh bìa dự án')).toBeInTheDocument();
      expect(screen.getByText(/Kéo và thả ảnh vào đây/i)).toBeInTheDocument();
    });
  });
});
