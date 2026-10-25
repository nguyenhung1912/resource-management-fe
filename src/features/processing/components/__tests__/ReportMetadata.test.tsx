import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ReportMetadata } from '../ReportMetadata';
import { reportFixture } from './fixtures';

describe('historical policy metadata', () => {
  it('renders each reports own policy and revision', () => {
    const report = reportFixture;
    const { rerender } = render(<ReportMetadata report={report} />);
    expect(screen.getByText('≤ 60%')).toBeInTheDocument();
    rerender(
      <ReportMetadata
        report={{ ...report, modelRevision: 'revision-two', policy: { approval_max_similarity_percent: 50 } }}
      />,
    );
    expect(screen.getByText('≤ 50%')).toBeInTheDocument();
    expect(screen.queryByText('revision-one')).not.toBeInTheDocument();
  });
});
