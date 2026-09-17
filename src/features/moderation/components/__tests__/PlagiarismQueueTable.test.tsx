import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { PlagiarismQueueTable } from '../PlagiarismQueueTable';
import type { ModerationResourceItemResponse } from '../../types/moderation.types';

// ─── Mock react-router navigate ────────────────────────────────────────────

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// ─── Fixtures ──────────────────────────────────────────────────────────────

const makeItem = (overrides: Partial<ModerationResourceItemResponse> = {}): ModerationResourceItemResponse => ({
  fileId: 'FIL_001',
  fileName: 'Báo cáo thực tập 2026',
  fileDescription: 'Mô tả báo cáo',
  fileUrl: 'https://example.com/file.pdf',
  fileTypeId: 1,
  fileTypeName: 'Báo cáo NCKH',
  subMajorCode: 'CNTT_KTPM',
  subMajorName: 'Kỹ thuật phần mềm',
  uploaderName: 'Nguyễn Văn A',
  uploaderEmail: 'nguyenvana@example.com',
  fileStatusId: 1,
  fileStatusName: 'Pending',
  createdAt: '2026-09-10T08:00:00Z',
  latestPlagiarismScore: null,
  ...overrides,
});

// ─── Tests ─────────────────────────────────────────────────────────────────

describe('PlagiarismQueueTable', () => {
  it('hiển thị empty state khi items rỗng', () => {
    render(
      <MemoryRouter>
        <PlagiarismQueueTable items={[]} />
      </MemoryRouter>,
    );
    expect(screen.getByText('Không tìm thấy tài liệu')).toBeInTheDocument();
  });

  it('render đúng số hàng theo items (desktop table)', () => {
    const items = [
      makeItem({ fileId: 'FIL_001', fileName: 'Tài liệu 1' }),
      makeItem({ fileId: 'FIL_002', fileName: 'Tài liệu 2' }),
      makeItem({ fileId: 'FIL_003', fileName: 'Tài liệu 3' }),
    ];
    render(
      <MemoryRouter>
        <PlagiarismQueueTable items={items} />
      </MemoryRouter>,
    );
    // Tên tài liệu xuất hiện trong DOM (có thể desktop + mobile)
    expect(screen.getAllByText('Tài liệu 1').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Tài liệu 2').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Tài liệu 3').length).toBeGreaterThanOrEqual(1);
  });

  it('gọi navigate với đúng MODERATION_DETAIL path khi click "Xem chi tiết"', () => {
    mockNavigate.mockClear();
    const item = makeItem({ fileId: 'FIL_XYZ' });
    render(
      <MemoryRouter>
        <PlagiarismQueueTable items={[item]} />
      </MemoryRouter>,
    );
    const buttons = screen.getAllByRole('button', { name: /Xem chi tiết/i });
    fireEvent.click(buttons[0]);
    expect(mockNavigate).toHaveBeenCalledWith(expect.stringContaining('FIL_XYZ'));
  });

  it('hiển thị "Chưa quét" khi latestPlagiarismScore là null', () => {
    render(
      <MemoryRouter>
        <PlagiarismQueueTable items={[makeItem({ latestPlagiarismScore: null })]} />
      </MemoryRouter>,
    );
    expect(screen.getAllByText('Chưa quét').length).toBeGreaterThanOrEqual(1);
  });

  it('hiển thị tỷ lệ score khi latestPlagiarismScore có giá trị', () => {
    render(
      <MemoryRouter>
        <PlagiarismQueueTable items={[makeItem({ latestPlagiarismScore: 35 })]} />
      </MemoryRouter>,
    );
    expect(screen.getAllByText(/35%/).length).toBeGreaterThanOrEqual(1);
  });

  it('hiển thị badge trạng thái "Đã duyệt" cho Approved', () => {
    render(
      <MemoryRouter>
        <PlagiarismQueueTable items={[makeItem({ fileStatusName: 'Approved' })]} />
      </MemoryRouter>,
    );
    expect(screen.getAllByText('Đã duyệt').length).toBeGreaterThanOrEqual(1);
  });

  it('hiển thị badge trạng thái "Từ chối" cho Rejected', () => {
    render(
      <MemoryRouter>
        <PlagiarismQueueTable items={[makeItem({ fileStatusName: 'Rejected' })]} />
      </MemoryRouter>,
    );
    expect(screen.getAllByText('Từ chối').length).toBeGreaterThanOrEqual(1);
  });

  it('render tên người upload và tên chuyên ngành', () => {
    render(
      <MemoryRouter>
        <PlagiarismQueueTable items={[makeItem()]} />
      </MemoryRouter>,
    );
    expect(screen.getAllByText('Nguyễn Văn A').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Kỹ thuật phần mềm').length).toBeGreaterThanOrEqual(1);
  });
});
