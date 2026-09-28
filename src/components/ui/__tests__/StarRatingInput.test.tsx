import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { StarRatingInput } from '../StarRatingInput';

describe('StarRatingInput', () => {
  it('renders 5 star buttons and radiogroup', () => {
    render(<StarRatingInput value={3} onChange={vi.fn()} />);

    expect(screen.getByRole('radiogroup')).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(5);
    expect(screen.getByTestId('star-input-label')).toHaveTextContent('Bình thường');
  });

  it('calls onChange with star number when clicked', () => {
    const handleChange = vi.fn();
    render(<StarRatingInput value={null} onChange={handleChange} />);

    fireEvent.click(screen.getByTestId('star-input-4'));
    expect(handleChange).toHaveBeenCalledWith(4);
  });

  it('updates label on hover and reverts on mouse leave', () => {
    render(<StarRatingInput value={2} onChange={vi.fn()} />);

    expect(screen.getByTestId('star-input-label')).toHaveTextContent('Cần cải thiện');

    // Hover on 5 stars
    fireEvent.mouseEnter(screen.getByTestId('star-input-5'));
    expect(screen.getByTestId('star-input-label')).toHaveTextContent('Xuất sắc');

    // Mouse leave radiogroup
    fireEvent.mouseLeave(screen.getByRole('radiogroup'));
    expect(screen.getByTestId('star-input-label')).toHaveTextContent('Cần cải thiện');
  });

  it('handles keyboard navigation (ArrowRight, ArrowLeft, Home, End)', () => {
    const handleChange = vi.fn();
    render(<StarRatingInput value={3} onChange={handleChange} />);

    const group = screen.getByRole('radiogroup');

    // ArrowRight increases value
    fireEvent.keyDown(group, { key: 'ArrowRight' });
    expect(handleChange).toHaveBeenCalledWith(4);

    // ArrowLeft decreases value
    fireEvent.keyDown(group, { key: 'ArrowLeft' });
    expect(handleChange).toHaveBeenCalledWith(2);

    // End sets to max
    fireEvent.keyDown(group, { key: 'End' });
    expect(handleChange).toHaveBeenCalledWith(5);

    // Home sets to 1
    fireEvent.keyDown(group, { key: 'Home' });
    expect(handleChange).toHaveBeenCalledWith(1);
  });

  it('does not trigger onChange when disabled or readOnly', () => {
    const handleChangeDisabled = vi.fn();
    const { rerender } = render(<StarRatingInput value={3} onChange={handleChangeDisabled} disabled />);

    fireEvent.click(screen.getByTestId('star-input-5'));
    expect(handleChangeDisabled).not.toHaveBeenCalled();

    const handleChangeReadOnly = vi.fn();
    rerender(<StarRatingInput value={3} onChange={handleChangeReadOnly} readOnly />);

    fireEvent.click(screen.getByTestId('star-input-5'));
    expect(handleChangeReadOnly).not.toHaveBeenCalled();
  });
});
