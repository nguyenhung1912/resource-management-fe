import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { DeleteResourceDialog } from '../DeleteResourceDialog';
import { ResourcesManager } from '../ResourcesManager';
import type { MyUploadItemResponse } from '../../types/resource.types';

const resource: MyUploadItemResponse = {
  id: 'resource-delete',
  fileName: 'Báo cáo thực tập_Final.pdf',
  fileTypeName: 'Báo cáo',
  fileSizeBytes: 2_516_582,
  uploadedAt: '2024-05-12T08:00:00.000Z',
  fileStatusId: 2,
  fileStatusName: 'Chờ duyệt',
  majorId: 'CNTT',
  majorName: 'Công nghệ thông tin',
  subMajorName: 'Kỹ thuật phần mềm',
  courseName: 'Thực tập doanh nghiệp',
  keywords: ['thực tập'],
  authors: [{ id: 'author-1', fullName: 'Nguyễn Văn A' }],
};

function renderManager() {
  return render(
    <MemoryRouter>
      <ResourcesManager items={[resource]} />
    </MemoryRouter>,
  );
}

describe('DeleteResourceDialog', () => {
  it('chỉ xóa tài nguyên sau khi người dùng nhập chính xác tên file', () => {
    renderManager();

    fireEvent.click(screen.getByRole('button', { name: `Xóa ${resource.fileName}` }));

    expect(screen.getByRole('dialog', { name: 'Xóa tài nguyên' })).toBeInTheDocument();
    expect(
      screen.getByText(/tài nguyên và mọi dữ liệu liên quan sẽ bị xóa vĩnh viễn và không thể khôi phục/i),
    ).toBeInTheDocument();

    const confirmButton = screen.getByRole('button', { name: 'Xóa vĩnh viễn' });
    const confirmationInput = screen.getByLabelText(/nhập tên file để xác nhận/i);
    expect(confirmButton).toBeDisabled();

    fireEvent.change(confirmationInput, { target: { value: 'Báo cáo thực tập' } });
    expect(confirmButton).toBeDisabled();

    fireEvent.change(confirmationInput, { target: { value: resource.fileName } });
    expect(confirmButton).toBeEnabled();
    fireEvent.click(confirmButton);

    expect(screen.queryByText(resource.fileName)).not.toBeInTheDocument();
    expect(screen.queryByRole('dialog', { name: 'Xóa tài nguyên' })).not.toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Danh sách tài nguyên' })).toHaveFocus();
  });

  it('xóa nội dung xác nhận khi đóng dialog', () => {
    renderManager();

    fireEvent.click(screen.getByRole('button', { name: `Xóa ${resource.fileName}` }));
    fireEvent.change(screen.getByLabelText(/nhập tên file để xác nhận/i), {
      target: { value: resource.fileName },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Hủy' }));
    fireEvent.click(screen.getByRole('button', { name: `Xóa ${resource.fileName}` }));

    expect(screen.getByLabelText(/nhập tên file để xác nhận/i)).toHaveValue('');
    expect(screen.getByRole('button', { name: 'Xóa vĩnh viễn' })).toBeDisabled();
  });

  it('không cho xác nhận khi tên file bị rỗng và mô tả hướng dẫn cho input', () => {
    render(<DeleteResourceDialog isOpen fileName="" onClose={() => undefined} onConfirm={() => undefined} />);

    const confirmationInput = screen.getByLabelText(/nhập tên file để xác nhận/i);
    expect(screen.getByRole('button', { name: 'Xóa vĩnh viễn' })).toBeDisabled();
    expect(confirmationInput).toHaveAccessibleDescription(/hãy nhập chính xác tên file/i);
  });
});
