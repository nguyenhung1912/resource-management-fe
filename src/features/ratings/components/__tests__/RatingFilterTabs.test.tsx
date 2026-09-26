import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { RatingFilterTabs } from '../RatingFilterTabs';

describe('RatingFilterTabs', () => {
  it('renders all filter pills (All, 5, 4, 3, 2, 1)', () => {
    render(
      <RatingFilterTabs
        selectedStar={null}
        counts={{ 5: 10, 4: 5, 3: 2, 2: 1, 1: 0 }}
        totalCount={18}
        onSelectStar={vi.fn()}
      />,
    );

    expect(screen.getByTestId('filter-tab-all')).toBeInTheDocument();
    expect(screen.getByTestId('filter-tab-all')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('filter-tab-5')).toBeInTheDocument();
    expect(screen.getByTestId('filter-tab-1')).toBeInTheDocument();
  });

  it('triggers onSelectStar with star number or null when clicked', () => {
    const handleSelectStar = vi.fn();
    render(<RatingFilterTabs selectedStar={null} counts={{ 5: 10 }} totalCount={10} onSelectStar={handleSelectStar} />);

    fireEvent.click(screen.getByTestId('filter-tab-5'));
    expect(handleSelectStar).toHaveBeenCalledWith(5);

    fireEvent.click(screen.getByTestId('filter-tab-all'));
    expect(handleSelectStar).toHaveBeenCalledWith(null);
  });
});
