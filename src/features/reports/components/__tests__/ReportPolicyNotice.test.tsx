import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ReportPolicyNotice } from '../ReportPolicyNotice';

describe('ReportPolicyNotice', () => {
  it('render đúng thông tin quy định và cảnh báo xử lý kỷ luật', () => {
    render(<ReportPolicyNotice />);

    expect(screen.getByRole('note')).toBeInTheDocument();
    expect(screen.getByText('Quy định về việc gửi báo cáo vi phạm:')).toBeInTheDocument();
    expect(
      screen.getByText(/Mọi hành vi cố tình báo cáo sai sự thật hoặc quấy rối sẽ bị xử lý kỷ luật/i),
    ).toBeInTheDocument();
  });
});
