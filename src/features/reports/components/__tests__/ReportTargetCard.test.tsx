import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ReportTargetCard } from '../ReportTargetCard';
import type { CommentTargetContext, FileTargetContext, UserTargetContext } from '@/features/reports/types/report.types';

describe('ReportTargetCard', () => {
  it('render đúng thông tin khi đối tượng là Tài liệu (File)', () => {
    const fileTarget: FileTargetContext = {
      type: 'File',
      id: 'FIL_001',
      title: 'Nghiên cứu ứng dụng Machine Learning trong NCKH',
      authorName: 'TS. Nguyễn Văn A',
      departmentName: 'Khoa Công nghệ Thông tin',
    };

    render(<ReportTargetCard target={fileTarget} />);

    expect(screen.getByText('Đối tượng bị báo cáo')).toBeInTheDocument();
    expect(screen.getByText('Tài liệu')).toBeInTheDocument();
    expect(screen.getByText(fileTarget.title)).toBeInTheDocument();
    expect(screen.getByText(fileTarget.authorName!)).toBeInTheDocument();
    expect(screen.getByText(fileTarget.departmentName!)).toBeInTheDocument();
  });

  it('render đúng thông tin khi đối tượng là Bình luận (Comment)', () => {
    const commentTarget: CommentTargetContext = {
      type: 'Comment',
      id: 'COM_001',
      content: 'Bình luận chứa nội dung phản cảm cần xem xét.',
      authorName: 'Trần Thị B',
      fileTitle: 'Luận văn Thạc sĩ Khoa học Máy tính',
    };

    render(<ReportTargetCard target={commentTarget} />);

    expect(screen.getByText('Bình luận')).toBeInTheDocument();
    expect(screen.getByText(commentTarget.authorName)).toBeInTheDocument();
    expect(screen.getByText(/Bình luận chứa nội dung phản cảm cần xem xét/)).toBeInTheDocument();
    expect(screen.getByText(/"Luận văn Thạc sĩ Khoa học Máy tính"/)).toBeInTheDocument();
  });

  it('render đúng thông tin khi đối tượng là Người dùng (User)', () => {
    const userTarget: UserTargetContext = {
      type: 'User',
      id: 'USR_001',
      fullName: 'Lê Văn C',
      userCode: '21001234',
      roleName: 'Sinh viên',
      departmentName: 'Khoa Kinh tế',
    };

    render(<ReportTargetCard target={userTarget} />);

    expect(screen.getByText('Người dùng')).toBeInTheDocument();
    expect(screen.getByText(userTarget.fullName)).toBeInTheDocument();
    expect(screen.getByText(userTarget.roleName!)).toBeInTheDocument();
    expect(screen.getByText('21001234')).toBeInTheDocument();
    expect(screen.getByText(userTarget.departmentName!)).toBeInTheDocument();
  });
});
