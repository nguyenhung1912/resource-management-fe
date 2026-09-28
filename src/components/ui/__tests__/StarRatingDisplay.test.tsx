import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StarRatingDisplay } from '../StarRatingDisplay';

describe('StarRatingDisplay', () => {
  it('renders 5 stars by default', () => {
    render(<StarRatingDisplay rating={4} />);
    expect(screen.getByRole('img')).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', '4.0 trên 5 sao');

    for (let i = 1; i <= 5; i++) {
      expect(screen.getByTestId(`star-display-${i}`)).toBeInTheDocument();
    }
  });

  it('renders filled and empty stars according to score', () => {
    render(<StarRatingDisplay rating={3} />);

    // Stars 1, 2, 3 should have fill element with 100% width
    expect(screen.getByTestId('star-fill-1')).toHaveStyle({ width: '100%' });
    expect(screen.getByTestId('star-fill-2')).toHaveStyle({ width: '100%' });
    expect(screen.getByTestId('star-fill-3')).toHaveStyle({ width: '100%' });

    // Stars 4 and 5 should not have star-fill element
    expect(screen.queryByTestId('star-fill-4')).not.toBeInTheDocument();
    expect(screen.queryByTestId('star-fill-5')).not.toBeInTheDocument();
  });

  it('renders fractional star fill correctly (e.g. 4.6)', () => {
    render(<StarRatingDisplay rating={4.6} />);

    expect(screen.getByTestId('star-fill-1')).toHaveStyle({ width: '100%' });
    expect(screen.getByTestId('star-fill-2')).toHaveStyle({ width: '100%' });
    expect(screen.getByTestId('star-fill-3')).toHaveStyle({ width: '100%' });
    expect(screen.getByTestId('star-fill-4')).toHaveStyle({ width: '100%' });

    // 5th star should have ~60% fill
    const fifthStarFill = screen.getByTestId('star-fill-5');
    expect(fifthStarFill).toBeInTheDocument();
    expect(fifthStarFill.style.width).toBe('60%');
  });

  it('renders score text and review count when enabled', () => {
    render(<StarRatingDisplay rating={4.8} showScore count={25} />);

    expect(screen.getByTestId('star-display-score')).toHaveTextContent('4.8');
    expect(screen.getByTestId('star-display-count')).toHaveTextContent('(25)');
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', '4.8 trên 5 sao (25 đánh giá)');
  });

  it('clamps negative or overly high rating values safely', () => {
    const { rerender } = render(<StarRatingDisplay rating={-2} />);
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', '0.0 trên 5 sao');

    rerender(<StarRatingDisplay rating={10} />);
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', '5.0 trên 5 sao');
  });
});
