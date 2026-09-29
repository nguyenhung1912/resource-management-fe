import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { HomeHeroSearch } from '../HomeHeroSearch';

describe('HomeHeroSearch', () => {
  it('renders hero title, description, and search input', () => {
    const handleSearch = vi.fn();
    render(<HomeHeroSearch onSearch={handleSearch} />);

    expect(screen.getByRole('heading', { name: 'Cổng Quản lý Tài nguyên Học liệu Số' })).toBeInTheDocument();
    expect(screen.getByRole('search')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/Tìm kiếm tài liệu, giáo trình, bài giảng, đề cương, tác giả.../i),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Tìm kiếm/i })).toBeInTheDocument();
  });

  it('triggers onSearch callback when form is submitted with non-empty keyword', () => {
    const handleSearch = vi.fn();
    render(<HomeHeroSearch onSearch={handleSearch} />);

    const input = screen.getByRole('searchbox');
    fireEvent.change(input, { target: { value: 'Machine Learning' } });

    const submitBtn = screen.getByRole('button', { name: /Tìm kiếm/i });
    fireEvent.click(submitBtn);

    expect(handleSearch).toHaveBeenCalledTimes(1);
    expect(handleSearch).toHaveBeenCalledWith('Machine Learning');
  });

  it('does not trigger onSearch when input is blank', () => {
    const handleSearch = vi.fn();
    render(<HomeHeroSearch onSearch={handleSearch} />);

    const submitBtn = screen.getByRole('button', { name: /Tìm kiếm/i });
    fireEvent.click(submitBtn);

    expect(handleSearch).not.toHaveBeenCalled();
  });

  it('triggers onSearch when a popular keyword tag is clicked', () => {
    const handleSearch = vi.fn();
    render(<HomeHeroSearch onSearch={handleSearch} />);

    const aiTag = screen.getByRole('button', { name: 'Trí tuệ nhân tạo' });
    fireEvent.click(aiTag);

    expect(handleSearch).toHaveBeenCalledTimes(1);
    expect(handleSearch).toHaveBeenCalledWith('Trí tuệ nhân tạo');
  });
});
